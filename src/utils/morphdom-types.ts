// https://github.com/aesy/morphdom/blob/0b6b2e87b5f1b193c40c4c64f25938846ccd4039/typings/morphdom.d.ts

declare module 'morphdom' {
  interface MorphDomOptions {
    getNodeKey?: (node: Node) => any,
    onBeforeNodeAdded?: (node: Node) => Node,
    onNodeAdded?: (node: Node) => Node,
    onBeforeElUpdated?: (fromEl: HTMLElement, toEl: HTMLElement) => boolean,
    onElUpdated?: (el: HTMLElement) => void,
    onBeforeNodeDiscarded?: (node: Node) => boolean,
    onNodeDiscarded?: (node: Node) => void,
    onBeforeElChildrenUpdated?: (fromEl: HTMLElement, toEl: HTMLElement) => boolean,
    childrenOnly?: boolean
  }

  namespace morphdom {}

  function morphdom (
    fromNode: Node,
    toNode: Node | string,
    options?: MorphDomOptions
  ): void

  export default morphdom
}
