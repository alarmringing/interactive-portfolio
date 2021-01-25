import { ShaderMaterial, Color } from 'three'
import { extend } from 'react-three-fiber'

class CustomMaterial extends ShaderMaterial {
	constructor() {
		super({
			vertexShader: `
				attribute float side;
    			out float vSide;
    			out vec2 vUv;

				void main() {
					vSide = side;
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
				}
			`,
			fragmentShader: `
				uniform sampler2D[6] textures;
				uniform float numSticks;
				uniform float index;
				uniform vec3 topBottomColor;
				in float vSide;
				in vec2 vUv;
				void main() {
					float boxSide = floor(vSide + 0.1);
					vec4 texelColor;

					vec2 uvVal = vec2((1./numSticks)*index + (vUv.x/numSticks), vUv.y);
					if (boxSide == 0.) texelColor = texture2D( textures[3], uvVal ); // SIDE D
					else if (boxSide == 1.) texelColor = texture2D( textures[1], uvVal ); // SIDE B
					else if (boxSide == 2.) texelColor = vec4(topBottomColor, 1.); //texture2D( textures[2], uvVal ); // TOP
					else if (boxSide == 3.) texelColor = vec4(topBottomColor, 1.); //texture2D( textures[3], uvVal ); // BOTTOM
					else if (boxSide == 4.) texelColor = texture2D( textures[0], uvVal ); // SIDE A
					else if (boxSide == 5.) texelColor = texture2D( textures[2], uvVal ); // SIDE C

					gl_FragColor = texelColor;
				}
			`,
			uniforms: {
				textures: { value: [null, null, null, null, null, null] },
				index: { value: 0 },
				numSticks: {value: 1},
				topBottomColor: {value: [1, 1, 1]}
			},
		})
	}
	set index(value) {
		this.uniforms.index.value = value
	}
	get index() { return this.uniforms.index.value }

	set numSticks(value) {
		this.uniforms.numSticks.value = value
	}
	get numSticks() { return this.uniforms.numSticks.value }

	set topBottomColor(value) {
		this.uniforms.topBottomColor.value = value
	}
	get topBottomColor() { return this.uniforms.topBottomColor.value }


	set textures(value) {
		this.uniforms.textures.value = value
	}
	get textures() { return this.uniforms.textures.value }

}

extend({ CustomMaterial })

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