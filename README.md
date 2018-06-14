**This repo is my obsession and WIP** - still not sure which one more.

**:heavy_exclamation_mark:watch out:heavy_exclamation_mark:** You are entering a point of no `return`.

# :fire: rxifire :fire:

**tl;dr;** Rx(JS) on stereoids

## Overview

Here are some broad and ambitious goals for this project:

 * **be minimal** - both with amount of code in the repo as well as code required to use this repo
 * **be lazy** - both with writing the code and letting the code to execute
 * **be flexible** - keep the future options open - a stream is ideal for this as it can have many, independent future interpretations
 * **be regular** - regular means predicatable and mockable; regularity is a necessary condition for composability 
 * **be generic** - the Observable interface is a sweet spot (most likely a global optimum) in the whole *Mathematical universe*, try to not diverge too much from it
 * **be very, very strict about types** - Typescript is the best thing that happened to Javascript **.**
 
### Components

*will add a video walkthrough soon; to play with the ugly demo `yarn install && yarn demo`*

Easily create components (right now only React's) with the following characteristics:

  1. logic, views and async effects 100% seperated
  2. auto-magically glue and inject events from view to logic
  3. upgrade async effects and auto-magically glue and inject info about async effects into views (and logic?)
  4. keep views 100% pure
  5. keep logic 100% stream from events, props etc into view state
  6. reduce boilerplate to minimum
  7. keep everything 100% typechecked with TS
  8. reduce amount of `return` to minimum - ideally to 0; reduce amount of `subscribe` (aka `execute`) to minimum - ideally to 1 per app
  9. increase transparency - make component's inner life Observable [todo]
  10. identify and handle all errors - eliminate any runtime exceptions - keep error local - allow easy retry of logic or effect [todo]

### Router

> I am the Router.
>   -- *Louis XIV*

With the routing we will be trying to put the components on steroids again.

### [...rest]

## Background

Here I am going to describe my advanture with Rx and what I learnt about it and what it tought me about me. 

### On being timeless

#### Here and now

#### Everywhere

#### The most timeless possible

### A tale of 3 types of processes

### State-Event duality

### Push-Pull duality

### What is Observable

#### Data structure?

#### Function?

#### Stream?

#### Task?

#### Process?

#### Data?

#### Superman?

### Observable and OOP

And then they were given two classes and asked to compose them.

### Theory

#### Monad

#### Co-Monad

#### RxNet, SigFlow

### Observable and Mindfulness
