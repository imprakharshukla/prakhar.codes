---
title: "Andronix"
description: "Andronix helps you install Linux distros on Android without root."
tags: ["Android", "ExpressJS", "Kotlin"]
pubDate: "Apr 04 2024"
link: "https://andronix.app"
github: "https://andronix.app/git"
heroImage: "/images/projects/andronix_app_banner.png"
status: "Completed"
publish: true
type: "Commercial"
languages: ["Kotlin", "Typescript", "C", "Bash"]
frameworks: ["VueJS","ExpressJS"]
---
## What is Andronix App?
Andronix helps you to install Linux distributions like Ubuntu, Debian, Manjaro, Kali etc. on un-rooted Android devices.

## How does this work?

Andronix is simple inside the hood (well not really, but most of it is simple to understand). Andronix uses **PRoot** to
run your favourite Linux distribution on your Android devices.

### What exactly is PRoot?

As stated in the official website of PRoot

> PRoot is a user-space implementation of **chroot, mount --bind, and binfmt_misc**. This means that users don't need
> any privileges or setup to do things like using an arbitrary directory as the new root file system, making files
> accessible somewhere else in the file system hierarchy, or executing programs built for another CPU architecture
> transparently through QEMU user-mode.


or in easier words, the benefits of enabling PRoot include running Linux operating systems in a
Termux [chroot](https://en.m.wikipedia.org/wiki/Chroot) on an Android smartphone, tablet and Chromebook.

We use **Termux** to provide the command line and the packages that are especially compiled for Termux implemented
inside Andronix

## My contribution to Andronix

### Android App

- I have developed the entire Android app using Kotlin and the **Model-View-ViewModel (MVVM) architecture**. This modern
  programming language, along with the powerful MVVM design pattern, has allowed me to create a scalable and
  maintainable codebase for the app.
- Utilized **Retrofit** to handle all API calls in our app. This popular HTTP client simplifies the process of making
  network requests and allows for a more efficient and reliable communication with our backend servers.
- Used Firebase Realtime Database and Firestore, and all the realtime listeners are handled using Kotlin's **StateFlow**
  and **SharedFlow** which are passed to the ViewModel and then to the UI using Kotlin coroutines.
- Andronix uses **Hilt**, a dependency injection library developed by Google, to efficiently manage and maintain the
  dependencies within the app. The implementation of this software design pattern, along with Hilt's code generation and
  testing support, results in a more robust and reliable user experience in Andronix.
- I have created a wrapper around the **Google Play Billing library v5.0** to allow for easier integration of payments
  in our app. By implementing this custom solution, I have been able to streamline the integration process and improve
  the overall user experience when making payments within the app.
- Implemented **single activity architecture** using **Jetpack Navigation Component**. This allows for a more efficient
  and reliable user experience when navigating between different screens in the app.

### Frontend

- I have developed the frontend of the Andronix app's websites using **NuxtJS** and **VueJS**, two popular JavaScript
  libraries. I have also employed TailwindCSS for styling, resulting in a visually appealing and user-friendly website.
  The combination of these technologies has allowed me to efficiently create and maintain the websites for our app
- Completely re-designed the websites from scratch and implemented a **modular approach** in the coding process. This
  systematic method of development has resulted in a more organized and efficient codebase, allowing for easier
  maintenance and updates to the websites.
- I have implemented automated **end-to-end testing** using **CypressJS** in order to ensure the quality and reliability
  of the websites. This powerful testing tool allows me to simulate user actions and verify that the websites are
  functioning as intended, ultimately improving the user experience.
- Implemented **unit testing** using the popular libraries **chai** and **mocha** in order to thoroughly test the
  individual components of the websites. This approach allows me to identify and fix any issues at the unit level,
  resulting in a more robust and reliable website overall.
- Added **Razorpay**, a payment gateway, to the websites in order to enable payments for our users. This integration
  allows us to securely process transactions and expand the functionality of the websites.

### Backend

- Developed the backend of Andronix to efficiently handle download requests at scale. The backend is powered by NodeJS (
  using the **ExpressJS** and **NestJS** frameworks), **Firebase**, **Hasura** (using **GraphQL**), and **Apollo
  GraphQL** for internal tooling. In order to ensure the quality and reliability of the backend, I have implemented
  testing using **ChaiJS** and **MochaJS**.
- Refactored the code to **Typescript** in order to improve the type safety and maintainability of the backend. This
  effort has resulted in an increase in the test coverage to over 80%. Additionally, I have utilized the Firebase
  emulators to increase the integration **test coverage from 0% to 78%**.
- **Modularized the API** into Internal, Commerce, and Product APIs in order to improve the organization and
  maintainability of the backend. This approach has allowed me to reduce the time spent on maintenance and more
  efficiently manage the various components of the API
- Transitioned the deployment of the backend from bare metal servers with **Nginx** as a load-balancer to the cloud
  using Render. This decision has allowed for **improved scalability and reliability of the backend**. In order to
  streamline the development process, I have also implemented CI/CD pipelines using **GitHub Actions** for **automated
  unit and integration testing**, as well as **automated deployment**.
