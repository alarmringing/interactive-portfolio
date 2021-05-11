import { ShaderMaterial, Color, ShaderChunk, UniformsUtils, UniformsLib } from "three";
import lenticularVert from "./shaders/lenticular_vert.glsl.js";
import lenticularFrag from "./shaders/lenticular_frag.glsl.js";
import { extend } from "react-three-fiber";

class CustomMaterial extends ShaderMaterial {
	constructor() {
		super({
			vertexShader: lenticularVert,
			fragmentShader: lenticularFrag,
			uniforms: UniformsUtils.merge([
				UniformsLib.common,
				UniformsLib.lights,
				UniformsLib.shadowmap,
				{
					textures: { value: [null, null, null, null, null, null] },
					index: { value: 0 },
					numSticks: { value: 1 },
					topBottomColor: { value: [1, 1, 1] },
					cameraVector: { value: [1, 1, 1] },
				},
			]),
			lights: true,
		});
	}
	set index(value) {
		this.uniforms.index.value = value;
	}
	get index() {
		return this.uniforms.index.value;
	}

	set numSticks(value) {
		this.uniforms.numSticks.value = value;
	}
	get numSticks() {
		return this.uniforms.numSticks.value;
	}

	set topBottomColor(value) {
		this.uniforms.topBottomColor.value = value;
	}
	get topBottomColor() {
		return this.uniforms.topBottomColor.value;
	}

	set textures(value) {
		this.uniforms.textures.value = value;
	}
	get textures() {
		return this.uniforms.textures.value;
	}

	set cameraVector(value) {
		this.uniforms.cameraVector.value = value;
	}
	get cameraVector() {
		return this.uniforms.cameraVector.value;
	}
}

extend({ CustomMaterial });

/*
					vec4 texelColor = vec4(0);
      float boxSide = floor(vSide + 0.1);
      
      vec2 uvs = vUv;
      if (boxSide == 0.) { // rotate the texture on the first side (pos x)
        uvs -= 0.5;
        float a = time;
        uvs *= mat2(cos(a), -sin(a), sin(a), cos(a));
        uvs += 0.5;
      }

      if (boxSide == 0.) texelColor = texture2D( textures[0], uvs );
      else if (boxSide == 1.) texelColor = texture2D( textures[1], uvs );
      else if (boxSide == 2.) texelColor = texture2D( textures[2], uvs );
      else if (boxSide == 3.) texelColor = texture2D( textures[3], uvs );
      else if (boxSide == 4.) texelColor = texture2D( textures[4], uvs );
      else if (boxSide == 5.) texelColor = texture2D( textures[5], uvs );
      
      
      
      //texelColor = mapTexelToLinear( texelColor );
      diffuseColor *= texelColor;
      */
