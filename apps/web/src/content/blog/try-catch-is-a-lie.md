---
title: "Try-Catch is a Lie: Why TypeScript Error Handling is Broken (and How to Fix It)"
description: "TypeScript catches every type error except the ones that crash your app at 2 AM. Here's how to build a Result type that makes errors impossible to ignore."
pubDate: "Feb 17 2026"
heroImage: "/images/blogs/try-catch-is-a-lie.jpg"
tags: ["TypeScript", "Error Handling", "Patterns"]
category: "Coding"
publish: true
---

TypeScript's type system is incredible. It catches typos, enforces shapes, and yells at you when you pass a `string` where a `number` belongs.

But there's a gaping hole: **errors**.

TypeScript has absolutely zero opinions about what a function can throw. The compiler doesn't track it. The type system doesn't model it. You get `unknown` in the catch block, and you're on your own.

This means errors are invisible. And invisible errors are the ones that wake you up at 2 AM.

## TypeScript Errors Have No Types

Let's start with the most fundamental problem. In TypeScript, errors aren't typed. At all.

```typescript
function parseConfig(raw: string): Config {
  const parsed = JSON.parse(raw); // throws SyntaxError
  if (!parsed.version) {
    throw new Error("Missing version field"); // throws Error
  }
  if (parsed.version > MAX_VERSION) {
    throw new RangeError("Unsupported version"); // throws RangeError
  }
  return parsed as Config;
}
```

Three different error types. The function signature says nothing about any of them. The caller has no idea what to expect:

```typescript
try {
  const config = parseConfig(input);
} catch (e) {
  // e is `unknown`
  // Is it SyntaxError? Error? RangeError? A string someone threw?
  // TypeScript has no opinion. You're guessing.
}
```

Java has `throws` declarations. Rust has `Result<T, E>`. Go returns `(value, error)`. Even Python has docstring conventions. TypeScript gives you... `unknown`. The most sophisticated type system in mainstream web development, and it completely gives up at the one place where types matter most.

This isn't a minor inconvenience. It means:

- **No autocomplete** on error properties in catch blocks
- **No compile-time checks** for unhandled error types
- **No way to know** what errors a function can throw without reading its source (and every function it calls, recursively)
- **No refactoring safety**. Change an error type deep in a call stack? The compiler won't tell you about any of the catch blocks that now handle the wrong thing.

And it gets worse. Because `throw` accepts *anything*:

```typescript
throw "something went wrong";     // string
throw 42;                          // number
throw { code: "NOT_FOUND" };      // object
throw undefined;                   // yes, this is valid
```

Your catch block doesn't just handle `Error` instances. It handles the entire universe of JavaScript values. Good luck writing exhaustive error handling for that.

## How Errors Disappear

You don't need complex code for errors to vanish. Here are three patterns that silently eat exceptions, and you've probably shipped all of them.

**1. The Silent forEach**

```typescript
async function syncAllUsers(users: User[]) {
  const api = new ExternalApiClient();

  users.forEach(async (user) => {
    const profile = await api.fetchProfile(user.id);
    await db.upsert("profiles", {
      userId: user.id,
      data: profile,
      syncedAt: new Date(),
    });
  });

  console.log("All users synced successfully"); // this always prints
}
```

`forEach` doesn't await the returned promises. If `fetchProfile` throws for user #3 out of 50, you'll never know. The success log always prints. Your database is silently missing records and nobody finds out until a customer complains weeks later.

**2. The Event Listener Void**

```typescript
function setupRealtimeSync(db: Database) {
  const stream = db.watch("orders", { fullDocument: "updateLookup" });

  stream.on("change", async (change) => {
    const order = change.fullDocument;
    const enriched = await inventoryService.enrich(order);
    await searchIndex.upsert(enriched);
    await notifyWarehouse(enriched);
  });

  stream.on("error", (err) => logger.warn("stream hiccup", err));
}
```

The `async` callback on `'change'` returns a promise that Node's EventEmitter completely ignores. If `inventoryService.enrich` throws, there's no `unhandledRejection`, Node swallows it inside `.on()`. Orders silently stop syncing to search. The `'error'` handler only catches stream-level errors, not your callback failures. Your search index drifts from reality and nobody notices until "why can't customers find this order?"

**3. The Payout Cron**

This is the one that really hurts. A monthly payout job that touches six services:

```typescript
async function processMonthlyPayouts() {
  const sellers = await db.getActiveSellers();

  for (const seller of sellers) {
    try {
      const balance = await ledger.getBalance(seller.id);
      const fees = await feeService.calculate(balance, seller.plan);
      const payout = await stripe.transfers.create({
        amount: balance - fees,
        destination: seller.stripeAccountId,
      });
      await ledger.recordPayout(seller.id, payout.id, balance, fees);
      await notificationService.send(seller.id, "payout_complete", { amount: balance - fees });
      await analyticsService.track("payout_processed", { sellerId: seller.id });
    } catch (e) {
      // e is `unknown`. Which of the 6 steps failed?
      // Was money transferred but not recorded in the ledger?
      // Was the fee calculated wrong, or did Stripe reject it?
      // Did we send a "payout complete" notification for a failed payout?
      await db.flagSellerForReview(seller.id);
      logger.error("Payout failed", { sellerId: seller.id, error: e });
    }
  }
}
```

Six services. Six potential failure points. And every one of *those* functions has its own internal calls that can throw. `feeService.calculate` might call a tax API. `stripe.transfers.create` might fail after preauthorization. `ledger.recordPayout` might timeout after Stripe already moved the money.

Your try-catch doesn't know if money moved or not. It doesn't know if the notification was sent for a payout that never happened. The type system tells you absolutely nothing about what any of these functions can throw, or when they throw, what state the world is in.

Now multiply this by every cron job, every webhook handler, every background worker in your codebase. Every single one is a prayer that nothing throws in an order you didn't anticipate.

---

Every function in these examples has no type-level indication that it can fail. The compiler is perfectly happy. The code looks clean. And errors vanish into the void.

In Go, you'd write `value, err := doSomething()` and the compiler forces you to handle `err`. In Rust, you get `Result<T, E>` and the compiler won't let you use the value without handling the error case.

In TypeScript? You get vibes and prayer.

Let's fix that.

## Building a Result Type from Scratch

The idea is simple: instead of throwing errors, **return them**. Make the possibility of failure part of the return type so the compiler can enforce handling.

```typescript
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };
```

That's it. A function either succeeds with a value or fails with an error. Both are explicit. Both are typed.

```typescript
function divide(a: number, b: number): Result<number, string> {
  if (b === 0) {
    return { ok: false, error: "Division by zero" };
  }
  return { ok: true, value: a / b };
}

const result = divide(10, 0);
if (!result.ok) {
  console.error(result.error); // TypeScript knows this is string
  return;
}
console.log(result.value); // TypeScript knows this is number
```

No try-catch. No `unknown`. The error type is right there in the signature. The compiler forces you to check before using the value.

### Helper constructors

Writing `{ ok: true, value: x }` everywhere is tedious. Let's add helpers:

```typescript
function Ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

function Err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}
```

Now the divide function reads cleaner:

```typescript
function divide(a: number, b: number): Result<number, string> {
  if (b === 0) return Err("Division by zero");
  return Ok(a / b);
}
```

### Wrapping throwable functions

Most of the ecosystem throws. You need a bridge:

```typescript
function tryCatch<T, E = Error>(fn: () => T): Result<T, E> {
  try {
    return Ok(fn());
  } catch (e) {
    return Err(e as E);
  }
}

async function tryPromise<T, E = Error>(
  fn: () => Promise<T>
): Promise<Result<T, E>> {
  try {
    return Ok(await fn());
  } catch (e) {
    return Err(e as E);
  }
}
```

Now you can wrap any existing code:

```typescript
const parsed = tryCatch(() => JSON.parse(rawInput));
if (!parsed.ok) {
  console.error("Invalid JSON:", parsed.error);
  return;
}
// parsed.value is typed and safe
```

```typescript
const response = await tryPromise(() => fetch("/api/users"));
if (!response.ok) {
  return Err("Network request failed");
}
```

The error is captured at the boundary. From there on, it flows through the type system.

## Making It Composable

The basic Result type works, but chaining operations gets ugly fast:

```typescript
// This is painful
const userResult = await tryPromise(() => fetchUser(id));
if (!userResult.ok) return Err(userResult.error);

const profileResult = await tryPromise(() => fetchProfile(userResult.value));
if (!profileResult.ok) return Err(profileResult.error);

const avatarResult = await tryPromise(() =>
  fetchAvatar(profileResult.value.avatarId)
);
if (!avatarResult.ok) return Err(avatarResult.error);
```

This is the `if err != nil` of TypeScript. Correct, explicit, and tedious. Let's add methods to make it composable.

### map and mapError

```typescript
type Result<T, E = Error> =
  | { ok: true; value: T; map: <U>(fn: (v: T) => U) => Result<U, E> }
  | { ok: false; error: E; mapError: <F>(fn: (e: E) => F) => Result<T, F> };
```

In practice, implement it as a class:

```typescript
class OkResult<T> {
  readonly ok = true;
  constructor(readonly value: T) {}

  map<U>(fn: (value: T) => U): Result<U, never> {
    return Ok(fn(this.value));
  }

  mapError<F>(_fn: (error: never) => F): Result<T, F> {
    return this as any;
  }
}

class ErrResult<E> {
  readonly ok = false;
  constructor(readonly error: E) {}

  map<U>(_fn: (value: never) => U): Result<U, E> {
    return this as any;
  }

  mapError<F>(fn: (error: E) => F): Result<never, F> {
    return Err(fn(this.error));
  }
}
```

Now you can transform values and errors without unwrapping:

```typescript
const result = await tryPromise(() => fetch("/api/user"))
  .then(r => r.map(res => res.json()))
  .then(r => r.mapError(e => `Failed to fetch user: ${e.message}`));
```

### The generator pattern

Here's where it gets really interesting. JavaScript generators let you write what feels like imperative code, but with automatic error short-circuiting. Think of it like early returns for Results.

```typescript
function* gen<T, E>(
  fn: () => Generator<Result<any, E>, T, any>
): Generator<Result<any, E>, Result<T, E>, any> {
  const iterator = fn();
  let next = iterator.next();

  while (!next.done) {
    const result = next.value;
    if (!result.ok) {
      return Err(result.error);
    }
    next = iterator.next(result.value);
  }

  return Ok(next.value);
}
```

Now you can `yield*` Results and they automatically unwrap on success or short-circuit on failure:

```typescript
const saveBookmark = async (url: string) => {
  return gen(async function* () {
    // Each yield* unwraps the Ok value
    // If any step fails, the whole function returns Err
    yield* await tryPromise(() => ensureTables())
      .then(r => r.mapError(e => `DB init failed: ${e}`));

    const title = yield* await tryPromise(() => fetchTitle(url))
      .then(r => r.mapError(e => `Failed to fetch title: ${e}`));

    yield* await tryPromise(() =>
      db.insert({ url, title })
    ).then(r => r.mapError(e => `Insert failed: ${e}`));

    return Ok({ url, title });
  });
};

// Usage
const result = await saveBookmark("https://example.com");
if (!result.ok) {
  // result.error is a descriptive string
  // You know exactly which step failed
  console.error(result.error);
}
```

Compare this to the try-catch version. Every error is typed, every failure point is labeled, and nothing gets silently swallowed. The generator handles the "unwrap or return early" pattern that makes Rust's `?` operator so nice.

## The Contrast

Let's look at the same function two ways.

**Try-catch (silent failures possible):**

```typescript
async function processUpload(file: File) {
  try {
    const validated = validate(file);
    const compressed = await compress(validated);
    const url = await upload(compressed);
    await saveToDb(url);
    return { success: true, url };
  } catch (e) {
    return { success: false, error: "Upload failed" };
    // Which step? What error? Who knows.
  }
}
```

**Result type (every failure is explicit):**

```typescript
async function processUpload(file: File) {
  return gen(async function* () {
    const validated = yield* tryCatch(() => validate(file))
      .mapError(e => `Validation: ${e.message}`);

    const compressed = yield* await tryPromise(() => compress(validated))
      .then(r => r.mapError(e => `Compression: ${e.message}`));

    const url = yield* await tryPromise(() => upload(compressed))
      .then(r => r.mapError(e => `Upload: ${e.message}`));

    yield* await tryPromise(() => saveToDb(url))
      .then(r => r.mapError(e => `DB save: ${e.message}`));

    return Ok(url);
  });
}
```

Slightly more code. Infinitely more information when something goes wrong.

## Libraries That Make This Painless

You now understand how Result types work under the hood. You *could* maintain your own implementation, but you don't have to. These libraries handle the edge cases, async patterns, and TypeScript inference so you can focus on your actual code:

- **[better-result](https://github.com/plandek-utils/better-result)**: Full Result type with `Result.gen()` for generators, `Result.tryPromise()`, `mapError`, and clean chaining. This is what I reach for in my projects.
- **[neverthrow](https://github.com/supermacro/neverthrow)**: Popular, well-maintained, excellent TypeScript inference. `ResultAsync` makes promise-based chains feel native.
- **[ts-results](https://github.com/vultix/ts-results)**: Rust-inspired with `Option` and `Result` types. If you've written Rust and miss it, this is your pick.
- **[effect](https://effect.website/)**: The full effect system. Typed errors, dependency injection, concurrency, retries, scheduling. Overkill for a CRUD app. Incredible if you're building something where failure modes actually matter (payments, infra, orchestration).

Pick whichever fits your style. The point isn't the library. The point is to stop treating errors as an afterthought that try-catch will magically handle for you.

## The Takeaway

TypeScript's type system is one of the best in the mainstream programming world. But its error handling is stuck in the JavaScript era: untyped, implicit, and easy to get wrong.

Result types fix this by making errors **values**. Values that flow through the type system, that compose with map and generators, and that the compiler can actually reason about.

You don't need to rewrite your codebase overnight. Start with the functions that matter: API calls, database queries, file operations. Wrap them in `tryPromise`. Return Results. Let the type system do what it's good at.

Your 2 AM self will thank you.

---
