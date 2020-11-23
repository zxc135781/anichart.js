import { Hintable, DefaultHinter, Hinter } from "./hint";
import { DefaultFontOptions } from "./../options/font-options";
import { merge } from "lodash-es";
import {
  enhanceCtx,
  EnhancedCanvasRenderingContext2D,
} from "../utils/enhance-ctx";
import { select } from "d3-selection";
import Ani from "./ani";
import { Component } from "../components";
import { csv } from "d3-fetch";
import { csvParse, DSVRowArray } from "d3-dsv";
import { interval, Timer } from "d3-timer";
import { ColorManager } from "./color";
import { FontOptions } from "../options/font-options";
class Scene implements Ani {
  fps = 12;
  sec = 6;
  width = 1366;
  height = 768;
  output = false;
  cFrame = 0;
  components: Component[] = [];
  totalFrames: number;
  canvas: HTMLCanvasElement;
  ctx: EnhancedCanvasRenderingContext2D;
  data: DSVRowArray<string>;
  meta: DSVRowArray<string>;
  player: Timer;
  color: ColorManager = new ColorManager();
  font: FontOptions = new DefaultFontOptions();
  hinter: Hinter = new DefaultHinter();

  constructor(options: object = {}) {
    this.setOptions(options);
  }

  addComponent(c: Component): void {
    c.ani = this;
    this.components.push(c);
    this.setOptions({});
    c.reset();
    this.hinter.drawHint(`Component Added: ${c.constructor.name}`);
  }

  ready(): void {
    throw new Error("Method not implemented.");
  }
  play() {
    this.update();
    if (this.player) {
      this.player.stop();
      this.player = null;
      return;
    }
    if (this.output) {
      while (this.cFrame < this.totalFrames) {
        this.draw(this.cFrame++);
      }
    } else {
      let start = new Date().getTime();
      this.player = interval(async () => {
        this.draw(this.cFrame++);
        if (this.cFrame >= this.totalFrames) {
          this.player.stop();
          this.hinter.drawHint(
            `Finished! FPS: ${(
              (this.sec * this.fps) /
              ((new Date().getTime() - start) / 1000)
            ).toFixed(2)}`
          );
        }
      }, (1 / this.fps) * 1000);
    }
  }
  draw(frame: number): void {
    try {
      this.drawBackground();
      this.components.forEach((component) => {
        component.draw(frame);
      });
    } catch (error) {
      console.error(error);
      this.player.stop();
    }
  }

  setOptions(options?: object): void {
    if (options) merge(this, options);
    this.update();
  }
  update(): void {
    this.totalFrames = this.fps * this.sec;
    this.hinter.width = this.width;
    this.hinter.height = this.height;
    this.components.forEach((c) => {
      c.reset({});
    });
  }

  setCanvas(selector?: string): void {
    if (typeof window != "undefined") {
      this.canvas = <HTMLCanvasElement>select(selector).node();
      if (!this.canvas || this.canvas.getContext == undefined) {
        this.initCanvas();
      }
    } else {
      const { createCanvas } = require("canvas");
      this.canvas = createCanvas(this.width, this.height);
    }
    this.ctx = enhanceCtx(this.canvas.getContext("2d"));
    this.hinter.ctx = this.ctx;
  }

  private initCanvas(): void {
    this.canvas = select("body")
      .append("canvas")
      .attr("width", this.width)
      .attr("height", this.height)
      .node();
  }

  preRender() {}

  private drawBackground() {
    this.ctx.save();
    this.ctx.fillStyle = this.color.background;
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.restore();
  }
}
export { Scene };