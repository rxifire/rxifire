# :fire: rxifire :fire:

> All things are an interchange for fire, and fire for all things, just like goods for gold and gold for goods. -- *Heraclitus*

**:heavy_exclamation_mark:watch out:heavy_exclamation_mark:** You are entering a point of no `return`.

**This project is my obsession (fire) and WIP (work in process)** - still not sure which one more.

## Rxify code

With help of this library you can _rxify_ your code and extract full power out of [RxJS](https://github.com/reactivex/rxjs). The process of defining the scope is still active.

### Components

*will add a video walkthrough soon; to play with the ugly demo `yarn install && yarn demo`*

Easily create components (right now only React's) with the following characteristics:

  1. logic, views and async effects 100% separated
  2. auto-magically glue and inject event streams from view to logic
  3. upgrade async effects and auto-magically glue and inject info about async effects into views and allow `reset` and stopping async effect; present view with status of the effect (active, in-progress, success, error) with its result / error
  4. keep views 100% pure functions
  5. keep logic 100% a stream from events, props etc into the view state
  6. reduce boilerplate to minimum
  7. keep everything 100% typechecked with TS
  8. reduce amount of `return` to minimum - ideally to 0; reduce amount of `subscribe` (aka `execute`) to minimum - ideally up to 1 per whole app
  9. increase transparency: auto-magically inject info about logic status (loading, active, completed, error) to view and allow retry / repeat [done]; make component's inner life Observable [todo]
  10. identify and handle all errors - eliminate any runtime exceptions [todo]
  11. forms support including async validation [todo]
  12. animations and smoothness support [todo]
  13. multiple views / union types state (additional support) [todo]

React is very handy as the rendering engine, but any other rendering technology should be compatible with this approach.

Another thing worth exploring is returning from logic a stream of commands to interpret by the renderer. So no need of diffing the state when updating the view. It should be very beneficial in case of a (mutable) list of items.

#### Why views should be pure

In the docs of react (up to version 15.3.2) one could find:

> In an ideal world, most of your components would be stateless functions because in the future we’ll also be able to make performance optimizations specific to these components by avoiding unnecessary checks and memory allocations. This is the recommended pattern, when possible.

The sentence disappeared, as the react team started experimenting with async rendering, but `pureness` is nonetheless really beneficial. Possible optimizations are one thing, but much more important is reasoning about the code. A functional component is 100% predictable, 100% reusable and could be just thought of as a markup / template engine on steroids.
As a side effect (pun intended) of having most of the views in the project pure, one can easily organize the work team around it. Some team members may specialize in working (just) with views - the work can be very easily parallelized. Since a view is just a deterministic projection, mocking the state allows easy testing. On top of that pure views are ideal when targeting multiple environments (e.g. React and React Native).

#### Why logic should be a function from input Observables to one output Observable

The role of the logic is to _interpret_, _run_, and _react to_ some other streams / processes (for example: user gestures, real-time updates to external state, timers, React's props etc). Based on these inputs, logic produces an execution plan - a description how to transform these streams into a desired ui state stream. **Having just one execution plan is desired, as there is no decision involved what should be executed**. Logic can have multiple input streams, but it produces just one output stream - analogously how a mathematical function transforms multiple input values into a single value. A pure function could, actually, be thought of as a _proto-process_ - a very simple process indeed. So the way we express the logic is a generalization of mathematical function - a function extended with implicit time domain - a process spread out in time.

A good analogy is to treat logic as a manufacturing process. Based on some resources, that **may** arrive at different time points and be prepared by other processes, a process **may** produce some output across time aka _Observer.next_. Process **may** prepare some internal resources aka _Observable.create_. The first output value **may** arrive: immediately upon start , after some time or _never_. The process **may** stop automatically aka _Observer.complete_ or break aka _Observable.throw_ / _Observer.error_. A process **may** be always stopped by a process that uses it. When process is stopped any internal resources **must be** clean-up aka _dispose_ and all input processes **must be** stopped. If an input process breaks it **may** be fatal, or the process may try to _retry_ or _replace_ the broken one. Any process may produce waste _aka_ side effects. Process **should** be very careful with producing waste and have it always 100% under control.

[**todo** add more explanation; testability, side effects, keeping side effects injected]

 Having just one output is a conscious constraint, but multiple outputs could be emulated, at least to some degree, with union types. For some more advanced scenario multiple output stream could be required, but the aim for this library is not to expose it - or expose it, but try to offer single output stream option as well. Having more than one output streams hinders composability.

And the Observable interface is indeed very composable, minimal and each of its constituents is essential. The aim is to stick to it as close as possible. Having logic return an Observable allows for some _magic_, as one can always wrap an observable instance and build upon it. An observable is just execution plan and not execution itself. As such it can be analyzed and modified automatically, so it allows some form of meta programming. The possibilities here are mind boggling. Let me just whim your appetite with these [todo] scenarios:

 * A real-time visualization of the logic as a data flow - have very rough, generic and ugly prototype already (no merge-map and no multiple inputs supported). It is definitely doable, and should be even easier if all inputs and side effects are clearly defined - as in case of this of this lib

 * Automatic interception of all uncaught errors - this is nice but already implemented (please take a look at `demo/Meta`). So let's take it to the next level. On production when uncaught error happens, activate, for the problematic component, bug report mode, in which:

    * error is automatically collected and pinned down to the component, all information available about the context is logged
    * the logic is augmented as we want to pinned down the error further to concrete operator - in case of `flatMap` do it recursively
    * component immediately retries its logic, so user will need to take actions again and hopefully reproduce the error for use; optionally a nice message is displayed on top of the component and we politely ask user to reproduce the steps for us
    * component starts recording all user actions, other relevant input streams and info about side effects
    * when error happens again a full report is sent to server, with exact place in code
    * the bug report should allow replay exactly what happens
 
 * almost automatic support for remote control - logic-view communication is only data based and as such easily serializable; it is very easy to merge two streams together or replace a stream with another one; related idea: run logic in a web-worker


#### Why explicit side effects

[**todo**]

#### Why be very strict about types

I tried TS once early 2016 and the general experience was not that great. For long time I thought types would just bloat my code and make me fighting with them. I am not going to convert you - and you can easily use the lib without typescript support, but at current state TS is a wonderful technology of extremely high quality. Types are used to glue the pieces together and make sure everything is composable. They disappear at runtime leaving no overhead. They play quite nicely with Rx and data flow programming.

Another benefit is that having very regularly defined interface, it is possible to do some handy code transformation / generation and even further remove the need of boilerplate and mundane actions around code. Sure one can do it without types as well, but then one needs to debug in case of smallest divergence from initial assumptions.

### Dependencies Management

[**TODO NEXT**]

Use carried functions as Dependency Injection mechanism; reduce boilerplate; group dependencies of the same type; reduce `import` statements to absolute minimum: one per external dependency and up to one per file (just to import local types definitions). Everything else should be effortlessly injected where needed and its correctness confirmed by TS.

*Later Goal (rather ambitious and not a priority)*
Take dependencies to a meta level; offer very precise and real-time code updates and very granular and intelligent (diff and ui-action based) lazy loading. This goal overlaps closely with routing.  


### Router

[**TODO NEXT NEXT**]

> I am the Router. -- *Louis XIV*

With the routing we will be trying to put the components on steroids again.

### Layouting

[**TODO** Later or as part of routing]

Keep track of layout information, declare layouts as pure functions / relationships and auto-inject it to relevant components. Support smooth transitions. Let the layout information flow easily from the root down the hierarchy. 

### Visualizations

[**TODO** If I only had more time!]

This has the highest potential and ROI for sure. Displaying the data flow in real-time is only the beginning of fun ahead.

### [...moar]

## Rxify mind

> Our intellectual powers are rather geared to master static relations and that our powers to visualize processes evolving in time are relatively poorly developed. For that reason we should do (as wise programmers aware of our limitations) our utmost to shorten the conceptual gap between the static program and the dynamic process, to make the correspondence between the program (spread out in text space) and the process (spread out in time) as trivial as possible. -- *1968, E.W. Dijkstra*

**100%**.

The keyword here is: **process**.

Logic code is always a description of a process. A process may consists of multiple processes tangled together. The whole process might be hidden behind layers of abstractions, indirections, noise and mud; it might be scattered across multiple files and there might be no control over it. But it definitely is there, as basically the essence of programming is to take take some data in and produce some data out. It was true (at least) 50 years ago, it is true now.

If processes are a built in necessity, I strongly believe it is beneficial to use a paradigm which allows describing them in a natural and convenient way. Rx is exactly that: a powerful, essential and concise DSL for describing and managing processes evolving in time [**todo** examples / demo]. It offers full control over asynchronicity. Moreover, it is very likely that DSL offered by Rx is pretty close to the optimal one - please prove me wrong.

Not using a proper DSL for dealing with processes is a valid option for sure. But then one is left with developing non-composable, low-quality, costly and error-prone mechanisms in an ad-hoc manner [**todo** add specific examples and reference it here].

Proper support for creating and reasoning about processes spread out in time is the top priority for this project. The path to the goal may lead via: 
 
  * keeping code for defining a process decoupled from its environment and dependencies - concentrate only on the essence
  * glueing of processes should be effortless ideally automatic
  * managing and reducing feedback loops - know your enemy and keep it under control, if possible hide it
  * meta programming
  * proper visualizations :fire: - process describes a data flow graph - as such it can be represented graphically

Some broad guidelines we should strive for, when accomplishing the main goal:

 * **be composable** - maximize usage of pure functions _aka_ proto-processes and streams _aka_ processes
 * **be minimal** - both with amount of code in the repo as well as code required to use this repo - always treat code as debt
 * **be lazy** - both with writing the code and letting the code to execute
 * **be flexible** - keep the future options open - a stream is ideal for this as it can have many, independent future interpretations
 * **be regular** - regular means predictable and mockable; regularity is a necessary condition for composability 
 * **be generic** - the Observable interface is a sweet spot (very close to a global optimum) in the whole *Mathematical universe*, try to not diverge too much from it
 * **be testable** - sticking to pure functions and streams gives it for free; additionally all side effects should be very strictly defined and easily mockable
 * **be effortless** - prefer _push_ over _pull_
 * **be very, very strict about types** - Typescript is a wonderful technology and probably the best thing that happened to Javascript **.**

### Linear Causality, Feedback Loops and Q

Any _process_ can be thought of as a black box with some input wires and some output wires. Between processes there are wires connecting inputs and outputs. Thinking about processes in that way allows a very nice graphical representation [**todo** image/demo/visualization].

 Types of processes are defined by what is allowed as a valid connection and as a valid wire. As far as I know there are three main types of processes [**todo** exact source]:

  1. linear causality - outputs connected to inputs - precisely one output to one input, **no cycles allowed**. The whole process can be decomposed into smaller stages / steps. Stuff flows from sources to sinks and black-boxes are partially ordered. Logic can be expressed with just _Observable_. No actions at distance.
  **Examples:** a script, handling http request, monitoring some external state in intervals (for example: web scrapping).
  2. feedback loops - extension of `1.` - **cycles are permitted**. So _further_ output may become input of _previous_ step. No very strict relationship of what causes what. They are much harder to reason about. In general they are expressed with _subjects_. Actions at distance possible.
  **Examples:** pretty all of UI, any state machine which allows traversing states in cycles.
  3. quantum - _some really crazy stuff_ extensions of `2.` - there are two types of wires, via one time flows backwards. An input maybe connected to another input; an output maybe connected to another output. Whatever / whenever it potentially may mean. Rx is magical but offers no support for it. Yet.

_Side note_: Process without inputs: state. Process without outputs: effect.

By _no cycles allowed_ I mean no **direct** cycles in code, as everything is connected to everything else anyway. Especially, a lot of processes dealing with external state live between `1.` and `2.`, even if no direct cycles present in code. It is kind of gradient. For example: updating real-time db could emit updated value in source of the process pretty immediately, even though no direct subjects may be used, whereas some long running monitoring process may use information after days it was actually obtained. In general we want to keep the feedback loop 100% under control and as short as possible. The longer the feedback loop gets, the harder our ability to identify and reason about it. We should strive for removing any unnecessary feedback loops altogether and hiding the essential ones. Using abstraction to hide a feedback loop limits the possibility of misuse and allows adding some meta programming around it - input to feedback loop is where the action takes place.

Similarly as a mathematical function may be seen as a proto-process, an assignment operation `=` can be seen as a _proto-subject_. I find it both pragmatically and aesthetically appealing to limit use of `=` and _subjects_. Usage of _subjects_ is not advised in general - especially for Rx newcomers. 

From this perspective a nice measure of code base quality could be a ratio between amount of code of type `1.` and `2.`.

### Being or Becoming

> By taking diagrammatic language as a formal backbone for describing quantum theory (or any other physical theory, for that matter) one also subscribes to a new perspective on physical theories.
First, traditional physical theories take the notion of a _state of a system_ as the primary focus, whereas in diagrammatic theories, it is natural to treat arbitrary processes on equal footing with states. States are then treated just as a special kind of process, a _preparation_ process. In other words, there is a shift from focusing on _what is_ to _what happens_, which is clearly a lot more fun. This is very much in line with the concerns of computer science, where the majority of time and energy goes into reasoning about process (i.e. programs), and states (i.e. data) only exist to be used and communicated by programs. -- [Picturing Quantum Process](https://www.amazon.com/Picturing-Quantum-Processes-Diagrammatic-Reasoning/dp/110710422X) (p. 11-12)

I would be more than happy if you indeed decided to _subscribe_ to this new perspective. If you just did, here comes the first lesson: remember about _unsubscribe_ when subscribing, as they always should come together.

[**todo** expand with content]


### Processes - outside of programming

_Process_ is a very broad and extremely interesting concept.

From materialistic perspective **everything** is a process. There are physical processes and chemical reactions. A turtle is a process and _turtles all the way down_. 
Thinking is a process, human being is a process. Actually _human being_ is a bit of misnomer - better would: _human becoming_ - similarly as Stan Grof prefers to call himself Stan _Grofing_. There are social processes.

Everything that every existed was _somehow_ created and increasing entropy of the universe will eventually take care of it.

There is [process philosophy](https://en.wikipedia.org/wiki/Process_philosophy).

One has to go metaphysical to ponder concepts / entities which may not be a process, but the ground is shaky at best, as the act of pondering is a process itself. Even one of the safest bet for a non-process: _Nothingness_  can actually be seen as a process. Still not sure if more like `.empty` or `.never`.

### [TODO]

On being timeless (Here and now, Everywhere, The most timeless possible)

State-Event duality

Push-Pull duality

What is Observable (Data structure?, Function?, Stream?, Task?, Process?, Data?)

Theory: Monad, CoMonad? RxNet, SigFlow, ACT

Observable and OOP
And then they were given two classes and asked to compose them.

Observable and Mindfulness