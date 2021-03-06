import { Component } from "../component/Component";
import { Stage } from "../Stage";

export class Ani {
  stage?: Stage;
  children?: (Ani | Component)[];
  constructor(ani?: Ani) {
    this.stage = ani?.stage;
    this.children = ani?.children ?? [];
  }
  getComponent(sec: number): Component {
    return null;
  }
  setup(stage: Stage) {
    this.stage = stage;
    this.children.forEach((child: Component | Ani) => {
      child.setup(stage);
    });
  }
}
