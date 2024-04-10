---
title: "Lumoflo"
description: "Lumoflo aims to make e-commerce easy and acessible for small sellers."
tags: ["React", "Express", "NextJS", "E-Commerce"]
pubDate: "Apr 04 2024"
heroImage: "/images/projects/gramflow_pro_banner.png"
status: "In Progress"
publish: true
type: "Open Source"
languages: ["Typescript", "Javascript"]
frameworks: ["NextJS", "Express", "NodeJS"]
---

GramFlow enables sellers on Instagram to sell at scale. It is a platform that enables sellers to manage their inventory,
orders, and customers. GramFlow is a SaaS product that is built for the Indian market.

## Problem that GramFlow Solves

Instagram sellers often either have a page on instgram or have a website that they use to sell their products. They
often use a combination of WhatsApp and Instagram to manage their orders. This is a very inefficient way of managing
orders and customers. GramFlow solves this problem by providing a platform that enables sellers to manage their
inventory, orders, and customers all via a single platform i.e. Instagram.

Users just have to upload products to their Instagram pages as they usually do and we manage the rest.
Here's what we do:

- We automatically create a beautiful Admin Panel for the user where they can manage their inventory, orders, and
customers.
- The admin panel has a dashboard that shows the user their sales, orders, and customers. It also includes various
analytics and visualizes them in the form of graphs.
- The admin can create orders and pass the link to the customers after the payment.
- The admin can also create shipments directly on shipping partners like Shiprocket and Delhivery with a single click
and can even upload bulk CSV files to the dashboards of the same.
- We handle the notifications to the customer in the form of beautiful emails.
- We also create a customer facing web-app where the users can submit all details which is secured with OTPs on thier
emails. The customer data is saved for future orders.
- We also provide a beautiful customer facing order tracking page where the customers can track their orders.
- We automatically sync the shipment status from the shipping partners and update the customers via email and SMS.
- We mirror your instagram page, so in-case instagram is down, you can still view and ship your orders.

> tl;dr: We automate the entire process of selling on Instagram from the ordering to the shipping.

## Who is this for?

GramFlow is a solution designed for Instagram sellers that do not want to use/ do not have access to Instagram's
E-commerce offerings and do not want to have a E-commerce website since they are expensive and hard to manage, and also
requires duplication of posts on the website and Instagram.


## What is our tech stack?

We use the following tech stack:

- NextJS (App. Directory) w Typescript
- Turborepo (Monorepo)
- Tailwind CSS
- NextJS API Routes
- Trigger.dev (Scheduled Jobs and database Backups)
- Clouflare R2 (S3 alternative to store images and files)
- Prisma (Database ORM)
- Supabase (Postgres- Database)
- Shadcn UI
- Doppler (Environment Variables and Secret Management)
- Mailgun (Emails)
- Clerk.dev (Authentication for Admin Panel)
- Tremor (Dashboard's Visual Analytics)
- AWS S3 SDK
- Vercel KV (Syncing Instagram Posts)
- Jest (Testing [Coming soon])
- React Hook Form (Complex Forms)
- Zod (Schema Validation)
