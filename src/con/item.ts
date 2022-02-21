import vs from '../glsl/base.vert';
import fs from '../glsl/item.frag';
import { MyObject3D } from "../webgl/myObject3D";
import { Util } from "../libs/util";
import { Mesh } from 'three/src/objects/Mesh';
import { DoubleSide } from 'three/src/constants';
import { Func } from "../core/func";
import { Vector3 } from "three/src/math/Vector3";
import { ShaderMaterial } from 'three/src/materials/ShaderMaterial';
import { Color } from 'three/src/math/Color';
import { Object3D } from "three/src/core/Object3D";
import { Conf } from "../core/conf";
import { Scroller } from "../core/scroller";
import { Val } from '../libs/val';
import { Tween } from '../core/tween';
import { Param } from '../core/param';

export class Item extends MyObject3D {

  private _mesh:Array<Object3D> = []
  private _noise:number = Util.instance.random(0, 1)
  private _shakeVal:Val = new Val()
  private _isShake:boolean = false
  private _posNoise:Vector3 = new Vector3()

  public itemPos:Vector3 = new Vector3()
  public itemSize:Vector3 = new Vector3()

  constructor(opt:any = {}) {
    super()

    this.itemPos.x = opt.ix
    this.itemPos.y = opt.iy

    let num = 3
    for(let i = 0; i < num; i++) {
      const col = [0x000000, Param.instance.main.bgColor.value, Util.instance.randomArr(opt.col)][i]
      const m = new Mesh(
        opt.geo,
        new ShaderMaterial({
          vertexShader:vs,
          fragmentShader:fs,
          transparent:true,
          side:DoubleSide,
          uniforms:{
            alpha:{value:1},
            shadow:{value:i == 2 ? 1 : 0},
            color:{value:new Color(col)},
          }
        })
      )
      this.add(m)
      this._mesh.push(m)
    }

    this.visible = true
  }


  private _shake():void {
    if(this._isShake) return
    this._isShake = true

    Tween.instance.a(this._shakeVal, {
      val:[0, 1]
    }, 0.2, 0, null, null, () => {
      const r = 1
      this._posNoise.x = Util.instance.range(r)
      this._posNoise.y = Util.instance.range(r)
    }, () => {
      this._posNoise.x = this._posNoise.y = 0
    })
}


  // ---------------------------------
  // 更新
  // ---------------------------------
  protected _update():void {
    super._update()

    const sw = Func.instance.sw()
    const sh = Func.instance.sh()
    const s = Scroller.instance.val.y
    const sr = s / ((sh * Conf.instance.SCROLL_HEIGHT - 1) - sh)

    const fixRate = Util.instance.mix(0.2, 1, this._noise)
    let rate = Util.instance.map(sr, 0, 1, 0, fixRate)
    if(!Param.instance.isStart) rate = 0

    if(rate >= 1) {
      this._shake()
    }

    if(this._isShake) rate = 1

    const size = Math.min(sw, sh) * 0.1
    this.itemSize.x = size

    // 影
    const shadowShakeRange = size * -0.15
    const shadowOffset = 1.2
    const shadow = this._mesh[0]
    shadow.position.x = 0 + this._posNoise.x * shadowShakeRange
    shadow.position.y = 0 + this._posNoise.y * shadowShakeRange
    shadow.scale.set(size * shadowOffset, size * shadowOffset, 1)

    // 白
    const bg = this._mesh[1]
    bg.position.x = 0 + this._posNoise.x * shadowShakeRange + size * 0.05
    bg.position.y = 0 + this._posNoise.y * shadowShakeRange - size * 0.05
    bg.scale.set(size * shadowOffset, size * shadowOffset, 1)

    // アイテム
    const itemShakeRange = size * 0.2
    const item = this._mesh[2]
    item.position.x = 0 + this._posNoise.x * itemShakeRange
    item.position.y = Util.instance.mix(sh * 2, 0, rate) + this._posNoise.y * itemShakeRange
    item.rotation.z = Util.instance.radian(this._posNoise.x * 60)
    item.scale.set(size, size, 1)
  }
}