You are a senior full-stack React Native engineer.

Build a complete hackathon-ready mobile application called TrueTaste.

TrueTaste is an AI-powered restaurant discovery, review, analytics, and rewards application.

The application allows users to:

- Discover restaurants
- Search restaurants by name, cuisine, or specific dish
- Select their city
- Set food/taste preferences
- View personalized AI restaurant recommendations
- Scan restaurant/table QR codes
- Submit text reviews
- Submit voice reviews
- Get AI-generated review summaries
- View restaurant review analytics
- Earn DineCoins for reviews
- Redeem DineCoins for rewards
- Subscribe to TrueTaste Premium
- Manage their profile and preferences

The application is primarily a mobile-first Expo React Native application.

---

1. NON-NEGOTIABLE TECHNOLOGY STACK

Mobile

Use:

- React Native
- Expo
- Expo SDK 54
- Expo Router
- TypeScript

The application must be compatible with Expo Go wherever possible.

Do not use unnecessary native modules or libraries that require custom native code.

Use Expo-compatible packages and APIs.

For example:

- expo-camera for QR scanning
- expo-location for location
- expo-audio or the Expo-supported audio API for voice recording
- expo-image
- expo-haptics
- expo-secure-store
- expo-linking
- expo-router

Use "npx expo install" for Expo packages so package versions stay compatible with the selected SDK.

---

2. BACKEND

Use:

- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose

Backend must be a separate application.

Architecture:

TrueTaste/
│
├── mobile/
│   ├── Expo React Native application
│   └── Expo Router
│
├── server/
│   ├── Node.js
│   ├── Express.js
│   ├── MongoDB
│   └── REST API
│
└── README.md

---

3. DATABASE

Use MongoDB with Mongoose.

Create appropriate models for:

User

Fields:

- name
- email
- password/auth provider
- avatar
- city
- cuisines
- favoriteDishes
- spicePreference
- budgetPreference
- dineCoins
- subscriptionStatus
- createdAt

---

Restaurant

Fields:

- name
- description
- images
- cuisine
- dishes
- rating
- reviewCount
- priceLevel
- address
- city
- latitude
- longitude
- openingHours
- isOpen
- createdAt

---

Review

Fields:

- userId
- restaurantId
- rating
- text
- voiceTranscript
- categoryRatings
- sentiment
- aiSummary
- createdAt

---

QR/Table

Fields:

- restaurantId
- tableNumber
- code
- active
- createdAt

---

Reward

Fields:

- title
- description
- type
- coinCost
- value
- image
- active

---

CoinTransaction

Fields:

- userId
- type
- amount
- description
- referenceId
- createdAt

---

Subscription

Fields:

- userId
- plan
- status
- startDate
- endDate

For the hackathon, subscription/payment can be mocked rather than implementing real payment processing.

---

4. BACKEND ARCHITECTURE

Use a clean structure:

server/
│
├── src/
│   ├── config/
│   │   ├── db.ts
│   │   └── env.ts
│   │
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── restaurant.controller.ts
│   │   ├── review.controller.ts
│   │   ├── recommendation.controller.ts
│   │   ├── reward.controller.ts
│   │   └── user.controller.ts
│   │
│   ├── models/
│   │   ├── User.ts
│   │   ├── Restaurant.ts
│   │   ├── Review.ts
│   │   ├── QRCode.ts
│   │   ├── Reward.ts
│   │   └── CoinTransaction.ts
│   │
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── restaurant.routes.ts
│   │   ├── review.routes.ts
│   │   ├── recommendation.routes.ts
│   │   ├── reward.routes.ts
│   │   └── user.routes.ts
│   │
│   ├── services/
│   │   ├── ai.service.ts
│   │   ├── recommendation.service.ts
│   │   └── coin.service.ts
│   │
│   ├── middleware/
│   │   ├── auth.ts
│   │   └── errorHandler.ts
│   │
│   ├── utils/
│   │
│   └── app.ts
│
└── package.json

Keep controllers, services, models, routes, and business logic separated.

---

5. MOBILE ARCHITECTURE

Use Expo Router.

Recommended structure:

mobile/
│
├── app/
│   ├── _layout.tsx
│   │
│   ├── index.tsx
│   │
│   ├── onboarding/
│   │   ├── index.tsx
│   │   ├── city.tsx
│   │   └── preferences.tsx
│   │
│   ├── auth/
│   │   ├── login.tsx
│   │   └── signup.tsx
│   │
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── home.tsx
│   │   ├── explore.tsx
│   │   ├── rewards.tsx
│   │   ├── activity.tsx
│   │   └── profile.tsx
│   │
│   ├── restaurant/
│   │   └── [id].tsx
│   │
│   ├── search/
│   │   └── index.tsx
│   │
│   ├── dish/
│   │   └── [query].tsx
│   │
│   ├── qr/
│   │   └── scanner.tsx
│   │
│   ├── review/
│   │   ├── index.tsx
│   │   ├── voice.tsx
│   │   └── success.tsx
│   │
│   ├── insights/
│   │   └── [restaurantId].tsx
│   │
│   ├── rewards/
│   │   └── redeem.tsx
│   │
│   ├── subscription.tsx
│   │
│   └── settings.tsx
│
├── components/
├── hooks/
├── services/
├── store/
├── constants/
├── types/
├── utils/
└── assets/

---

6. UI/UX DESIGN

Create a premium food-tech design.

Brand:

TrueTaste

Tagline:

Real experiences. Smarter recommendations.

Primary color:

#FF6B35

Dark:

#171717

Background:

#FAFAF8

Secondary background:

#F3F4F1

Cards:

#FFFFFF

Success:

#22C55E

Warning:

#F59E0B

Error:

#EF4444

Use a subtle purple/blue accent for AI components.

Use:

Inter or Manrope

Design must be:

- Mobile-first
- Clean
- Premium
- Modern
- Food-focused
- Easy to understand
- Thumb-friendly

Target design size:

390 × 844

---

7. BOTTOM NAVIGATION

Create five tabs:

1. Home
2. Explore
3. Rewards
4. Activity
5. Profile

Use Expo Router tab navigation.

Keep the bottom navigation visible throughout the main application.

---

8. SPLASH SCREEN

Show:

TrueTaste logo

TrueTaste

Real experiences. Smarter recommendations.

Then navigate to onboarding/auth/home depending on stored user state.

---

9. ONBOARDING

Create three onboarding screens.

Screen 1

Discover food made for you.

Screen 2

Share your experience.

Screen 3

Review. Earn. Enjoy.

Include illustrations/food imagery.

Store onboarding completion locally.

---

10. AUTHENTICATION

Implement:

- Signup
- Login
- Logout
- Persistent authentication
- Protected routes

Use JWT authentication.

Store JWT securely using:

expo-secure-store

Do not store authentication tokens in plain AsyncStorage.

---

11. CITY SELECTION

Allow user to:

- Select city
- Search city
- Use current location

Initial cities:

- Lahore
- Islamabad
- Karachi
- Rawalpindi
- Faisalabad
- Multan

Use location permission when user selects:

Use my location

---

12. TASTE PREFERENCES

Allow selection of:

Cuisines

- Pakistani
- Italian
- Chinese
- BBQ
- Fast Food
- Korean
- Mexican
- Desserts
- Cafe

Dishes

- Biryani
- Karahi
- Burger
- Pizza
- Pasta
- Steak
- Fried Chicken

Spice

Mild

Medium

Spicy

Very Spicy

Budget

$

$$

$$$

$$$$

Save preferences to MongoDB.

---

13. HOME SCREEN

Home must include:

Greeting:

Good evening 👋

Subtitle:

What are you craving today?

Search:

Search restaurants, dishes or cuisines...

Categories:

- Burgers
- Pizza
- BBQ
- Pakistani
- Chinese
- Cafes
- Desserts

AI section:

Picked for your taste ✨

Show restaurant cards with:

- Image
- Name
- Cuisine
- Rating
- Distance
- AI match percentage

Example:

92% match

---

14. SEARCH

Implement backend search.

Users should search by:

- Restaurant name
- Cuisine
- Dish

Example:

Search:

Chicken Karahi

Return restaurants that contain Chicken Karahi in their dishes.

Use MongoDB indexes where appropriate.

---

15. EXPLORE

Create:

- Search
- Filters
- Restaurant list
- Map/list toggle

Filters:

- Cuisine
- Rating
- Price
- Distance
- Open now
- AI Match

---

16. RESTAURANT DETAILS

Display:

- Hero image
- Restaurant name
- Cuisine
- Rating
- Review count
- Price
- Distance
- Address
- Opening status
- Dishes

Actions:

Get Directions

Write Review

---

17. AI REVIEW SUMMARY

Restaurant page should display an AI-generated summary.

Example:

AI Review Summary ✨

"Customers consistently praise the food quality and portion sizes. Service is generally positive, while waiting times receive mixed feedback."

Store AI-generated summaries where practical so the app does not repeatedly call the AI API for the same data.

---

18. REVIEW ANALYTICS

Display:

Overall rating

Taste %

Service %

Ambience %

Value %

Cleanliness %

Use a donut chart or progress indicators.

Keep charts mobile-friendly.

Use a React Native-compatible chart library that works with the selected Expo SDK.

---

19. QR SCANNER

Implement QR scanning using an Expo-compatible camera API.

The QR should identify:

- Restaurant
- Table

Example:

truetaste://review/restaurant123/table12

or an HTTPS deep link.

After scanning:

Show:

Restaurant found

Spice Route

Table 12

CTA:

Continue Review

Do not implement complex anti-fraud mechanisms for this hackathon MVP.

The purpose is simply to demonstrate the QR-based review workflow.

---

20. REVIEW FLOW

After QR scan:

Show restaurant.

Allow:

Rating

1–5 stars.

Text review

Text input.

Review tags

- Great food
- Fast service
- Friendly staff
- Good value
- Nice ambience
- Slow service
- Too expensive

Allow optional voice review.

---

21. VOICE REVIEW

Implement voice recording using Expo-compatible APIs.

Screen:

Tell us about your experience

Large microphone button.

States:

Idle:

Tap to record

Recording:

Recording...

Show animated waveform/timer.

Stop recording.

Upload audio to backend.

Backend sends audio to speech-to-text service.

Return transcript.

Show:

Your review

Allow user to edit transcript before submission.

Then submit.

If a speech-to-text API is unavailable, create a mock fallback for the hackathon.

---

22. AI PROCESSING

After review submission:

Show:

Analyzing your review...

Then:

Finding key insights...

Then:

Generating your summary...

AI should return:

- Summary
- Sentiment
- Category insights
- Optional tags

Example response:

{
  "summary": "The food was excellent...",
  "sentiment": "positive",
  "categories": {
    "taste": "positive",
    "service": "positive",
    "ambience": "neutral",
    "value": "positive"
  }
}

Do not expose AI API keys inside the mobile app.

All AI API calls must happen through the backend.

---

23. DINECOINS

When a valid review is submitted:

Award:

10 DineCoins

Display:

+10 DineCoins 🎉

Balance example:

240 DineCoins

Conversion:

1 DineCoin = $0.10

Create coin transaction records.

Never directly modify coin balances from the mobile client.

Use backend transactions/business logic.

---

24. REWARDS

Show:

Free Delivery

100 DineCoins

$5 Restaurant Coupon

50 DineCoins

20% Off

150 DineCoins

Implement redeem functionality.

When redeemed:

- Verify balance
- Deduct coins
- Create transaction
- Generate a simple mock coupon code

Example:

TT-8F2K9

---

25. PREMIUM SUBSCRIPTION

Create subscription UI.

Plan:

TrueTaste Premium

$4.99 / month

Benefits:

- Free delivery charges
- Exclusive restaurant offers
- Extra DineCoins
- Advanced AI recommendations
- Premium restaurant insights

For the hackathon, do not implement real payment processing.

Use a mock subscription flow.

---

26. AI RECOMMENDATIONS

Create backend endpoint:

GET /api/recommendations

Use:

- User preferences
- Favorite cuisines
- Favorite dishes
- Previous ratings
- Review history
- Restaurant cuisine
- Restaurant dishes
- Restaurant rating

Return personalized recommendations.

Each recommendation should include:

{
  "restaurantId": "...",
  "matchPercentage": 92,
  "reasons": [
    "You like Pakistani food",
    "You prefer spicy dishes",
    "You rated BBQ highly"
  ]
}

Show these reasons in the UI.

---

27. PROFILE

Show:

User name

Avatar

Reviews

DineCoins

Restaurants visited

Sections:

- Taste Preferences
- Favorite Cuisines
- Favorite Dishes
- Review History
- Rewards
- Subscription
- Settings

---

28. ACTIVITY

Show:

Recent reviews

DineCoin earnings

Reward redemptions

Restaurant activity

Use timeline cards.

---

29. FAVORITES

Allow users to favorite restaurants.

Use backend persistence.

Show favorites in Profile or a dedicated section.

---

30. GOOGLE MAPS

Use Google Maps where practical.

Restaurant detail should show:

- Restaurant location
- Address
- Distance

Add:

Get Directions

Use external Google Maps navigation/deep linking rather than building complex navigation.

If Google Maps API setup becomes a blocker during the hackathon, provide a clean fallback map placeholder and working directions link.

---

31. CLOUDINARY

Use Cloudinary for restaurant/user image storage.

Do not store large images directly in MongoDB.

MongoDB should store Cloudinary URLs.

Create reusable image upload logic on backend.

---

32. API ENDPOINTS

Create REST endpoints approximately like:

Auth

POST /api/auth/register
POST /api/auth/login
GET /api/auth/me

Restaurants

GET /api/restaurants
GET /api/restaurants/:id
GET /api/restaurants/search
GET /api/restaurants/:id/reviews

Reviews

POST /api/reviews
POST /api/reviews/voice
GET /api/reviews/my

QR

GET /api/qr/:code

Recommendations

GET /api/recommendations

Rewards

GET /api/rewards
POST /api/rewards/:id/redeem
GET /api/rewards/transactions

User

GET /api/users/me
PATCH /api/users/me
PATCH /api/users/preferences
GET /api/users/favorites
POST /api/users/favorites/:restaurantId
DELETE /api/users/favorites/:restaurantId

---

33. ENVIRONMENT VARIABLES

Mobile:

EXPO_PUBLIC_API_URL=
EXPO_PUBLIC_GOOGLE_MAPS_KEY=

Backend:

PORT=5000
MONGODB_URI=
JWT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
AI_API_KEY=

Never expose:

- MongoDB credentials
- JWT secret
- Cloudinary API secret
- AI API secret

inside the mobile application.

---

34. SEED DATA

Create a database seed script.

Include at least:

10–15 restaurants

Example cities:

- Lahore
- Islamabad
- Karachi

Each restaurant should contain:

- Images
- Cuisine
- Dishes
- Rating
- Reviews
- Location
- Price

Include realistic sample reviews so AI summaries and charts have meaningful data.

Also seed:

- Rewards
- Sample QR/table records

---

35. MOCK AI FALLBACK

The application must remain demoable even if the AI provider fails.

Create:

AI Service
    ↓
Real AI API
    ↓
If unavailable
    ↓
Mock AI response

The UI should never crash because an AI request failed.

Show a friendly fallback.

---

36. ERROR HANDLING

Implement:

- API error handling
- Network error handling
- Loading states
- Empty states
- Retry buttons
- Form validation
- Authentication errors

Never leave the user staring at a blank screen.

---

37. LOADING UX

Use skeleton loaders for:

- Restaurant lists
- Restaurant detail
- Recommendations
- Rewards

For AI:

Analyzing your review...

Use a subtle animated AI indicator.

---

38. STATE MANAGEMENT

Use a lightweight state-management solution.

Do not over-engineer.

Recommended:

- React Context for authentication/global user state

or

- Zustand if necessary.

Use React Query/TanStack Query for server state if appropriate.

Keep the architecture understandable for a student developer.

---

39. SECURITY BASICS

Implement:

- Password hashing with bcrypt
- JWT authentication
- Auth middleware
- Input validation
- Environment variables
- Proper CORS
- Basic rate limiting
- MongoDB query validation

Do not trust user-provided:

- User IDs
- Coin balances
- Reward prices
- Restaurant ownership
- Review ownership

All important business logic must be validated server-side.

---

40. CODE QUALITY

Use:

- TypeScript
- Clean naming
- Reusable components
- Reusable API service
- Consistent error handling
- Small functions
- Clear comments only where useful

Avoid:

- Huge components
- Duplicate code
- Hardcoded API URLs
- Hardcoded user balances
- Hardcoded restaurant data inside UI
- Business logic inside screens
- Secrets in frontend

---

41. DEMO-FIRST REQUIREMENT

This is a hackathon project.

The following flow MUST work end-to-end:

Open App
    ↓
Home
    ↓
Search Restaurant/Dish
    ↓
Open Restaurant
    ↓
View AI Summary
    ↓
Scan QR
    ↓
Submit Review
    ↓
AI Processing
    ↓
Review Submitted
    ↓
+10 DineCoins
    ↓
Rewards
    ↓
Redeem Reward

This is the most important demo flow.

Do not spend excessive time on secondary features before this flow works.

---

42. UI REQUIREMENTS

Every screen should have:

- Proper loading state
- Proper empty state
- Proper error state
- Consistent spacing
- Consistent typography
- Consistent colors
- Proper navigation
- Keyboard handling
- Safe-area handling

Use "SafeAreaView"/Expo-compatible safe area handling appropriately.

---

43. RESPONSIVENESS

Although the application is mobile-first, ensure it works on:

- 360px width
- 390px width
- 412px width

Avoid fixed widths that break smaller screens.

Use flexible layouts.

---

44. FINAL PROJECT STRUCTURE

The final repository should look approximately like:

TrueTaste/
│
├── mobile/
│   ├── app/
│   ├── components/
│   ├── services/
│   ├── hooks/
│   ├── store/
│   ├── constants/
│   ├── types/
│   ├── assets/
│   ├── app.json
│   ├── package.json
│   └── tsconfig.json
│
├── server/
│   ├── src/
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── README.md
└── .gitignore

---

45. README

Create a detailed but beginner-friendly README containing:

Project Overview

What TrueTaste does.

Features

List all implemented features.

Tech Stack

Mobile:

Expo + React Native + TypeScript

Backend:

Node.js + Express + TypeScript

Database:

MongoDB + Mongoose

Storage:

Cloudinary

AI:

Backend AI service

Installation

Explain:

cd server
npm install
npm run dev

and:

cd mobile
npm install
npx expo start

Explain how to open the app in Expo Go.

Environment Variables

Explain each variable.

MongoDB Setup

Explain how to create database and configure MongoDB URI.

Seed Database

Provide command:

npm run seed

Running

Explain the complete process.

---

46. IMPORTANT IMPLEMENTATION RULES

47. Do not build everything as static mock screens.

48. Connect mobile screens to the Express API.

49. Connect Express to MongoDB.

50. Restaurant data must come from MongoDB.

51. Reviews must be stored in MongoDB.

52. DineCoins must be stored and updated through backend logic.

53. AI requests must go through the backend.

54. Authentication must be functional.

55. QR scanning must work on the device.

56. Voice recording should work where supported by Expo Go.

57. Use mock fallbacks where external APIs are unavailable.

58. Do not introduce unnecessary dependencies.

59. Prefer Expo-supported packages.

60. Keep the project easy to run locally.

61. Make the primary hackathon demo flow fully functional before polishing secondary features.

---

47. DEVELOPMENT PROCESS

Build the project in this order:

Phase 1

Project setup

- Expo SDK 54
- Expo Router
- TypeScript
- Express
- MongoDB
- Environment variables

Phase 2

Authentication

- Register
- Login
- JWT
- Protected routes

Phase 3

Core restaurant system

- Restaurant model
- Seed data
- Restaurant API
- Search
- Restaurant detail

Phase 4

Mobile UI

- Home
- Explore
- Search
- Restaurant detail
- Navigation

Phase 5

QR + Reviews

- QR scanner
- Review form
- Voice review
- Review API

Phase 6

AI

- Review summary
- Sentiment
- Category analysis
- Recommendations

Phase 7

Rewards

- DineCoins
- Transactions
- Rewards
- Redemption

Phase 8

Profile

- Preferences
- Favorites
- Activity
- Subscription

Phase 9

Polish

- Loading states
- Empty states