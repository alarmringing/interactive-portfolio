import { ShaderMaterial, Color, ShaderChunk, UniformsUtils, UniformsLib } from "three";
import { extend } from "react-three-fiber";

class CustomMaterial extends ShaderMaterial {
	constructor() {
		super({
			vertexShader: [
				"attribute float side;",
				"out float vSide;",

				"out vec2 vUv;",
				"out vec3 vViewPosition;",
				ShaderChunk.common,
				ShaderChunk.lights_pars_begin,
				ShaderChunk.lights_pars_maps,
				ShaderChunk.shadowmap_pars_vertex,

				"void main() {",
				"vSide = side;",
				"vUv = uv;",

				ShaderChunk.beginnormal_vertex,
				ShaderChunk.defaultnormal_vertex,

				ShaderChunk.begin_vertex,
				ShaderChunk.project_vertex,
				//"vViewPosition = - mvPosition.xyz;",
				ShaderChunk.worldpos_vertex,
				ShaderChunk.shadowmap_vertex,
				"}",
			].join("\n"),
			// vertexShader: [
			// 	"attribute float side;",
			// 	"out float vSide;",
			// 	"out vec3 vNormal;",
			// 	"out vec2 vUv;",

			// 	"out vec3 vViewPosition;",
			// 	"out vec3 fPosition;",
			// 	"out vec2 vUvM;",
			// 	ShaderChunk.common,
			// 	ShaderChunk.lights_pars_begin,
			// 	ShaderChunk.shadowmap_pars_vertex,

			// 	"void main() {",
			// 	"vSide = side;",
			// 	"vUv = uv;",
			// 	"vNormal = (modelViewMatrix * vec4(normal, 0.)).xyz;",
			// 	"gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);",
			// 	ShaderChunk.shadowmap_vertex,
			// 	"}",
			// ].join("\n"),
			fragmentShader: [
				"uniform sampler2D[6] textures;",
				"uniform float numSticks;",
				"uniform float index;",
				"uniform vec3 topBottomColor;",
				"uniform vec3 cameraVector;",

				ShaderChunk.common,
				ShaderChunk.bsdfs,
				ShaderChunk.packing,
				ShaderChunk.lights_pars_begin,
				ShaderChunk.lights_pars_maps,
				ShaderChunk.lights_physical_pars_fragment,
				ShaderChunk.shadowmap_pars_fragment,
				ShaderChunk.shadowmask_pars_fragment,

				"in float vSide;",
				//"in vec3 vNormal;",
				"in vec2 vUv;",

				"void main() {",
				// This is the part that actually calculates the pixel color.
				"float boxSide = floor(vSide + 0.1);",
				"vec4 finalColor;",
				"vec2 uvVal = vec2((1./numSticks)*index + (vUv.x/numSticks), vUv.y);",
				"if (boxSide == 0.) finalColor = texture2D( textures[3], uvVal ); // SIDE D",
				"else if (boxSide == 1.) finalColor = texture2D( textures[1], uvVal ); // SIDE B",
				"else if (boxSide == 2.) finalColor = vec4(topBottomColor, 1.); //texture2D( textures[2], uvVal ); // TOP",
				"else if (boxSide == 3.) finalColor = vec4(topBottomColor, 1.); //texture2D( textures[3], uvVal ); // BOTTOM",
				"else if (boxSide == 4.) finalColor = texture2D( textures[0], uvVal ); // SIDE A",
				"else if (boxSide == 5.) finalColor = texture2D( textures[2], uvVal ); // SIDE C",

				// Attempts to enable shadows.
				"finalColor = vec4(0.5, 0.8, 0.2, 1.);",
				"vec3 shadowColor = vec3(0, 0, 0);",
				"float shadowPower = 0.9;",

				// ShaderChunk.lights_fragment_begin,
				// ShaderChunk.lights_fragment_maps,
				// ShaderChunk.lights_fragment_end,

				//"gl_FragColor = vec4( finalColor, 1.);",
				"gl_FragColor = vec4( mix(finalColor.xyz, shadowColor, (1.0 - getShadowMask()) * shadowPower), 1.0);",

				"}",
			].join("\n"),
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

					mapMain: { value: null },
					mapGlow: { value: null },
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
