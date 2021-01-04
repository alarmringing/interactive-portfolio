import { ShaderMaterial, Color } from 'three'
import { extend } from 'react-three-fiber'

class CustomMaterial extends ShaderMaterial {
	constructor() {
		super({
			vertexShader: `
				attribute float side;
    			out float vSide;

				void main() {
					vSide = side;
					gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
				}
			`,
			fragmentShader: `
				uniform sampler2D[6] textures;
				in float vSide;

				void main() {
					float boxSide = floor(vSide + 0.1);
					gl_FragColor = vec4(0.5, 0.3 + boxSide/10., 0.2, 1.);
				}
			`,
			uniforms: {
				textures: { value: [null, null, null, null, null, null] },
				index: { value: 0 },
			}
		})
	}
	set index(value) {
		this.uniforms.index.value = value
	}
	get index() { return this.uniforms.index.value }

	set map(value) {
		this.uniforms.textures.value = value
	}
	get map() { return this.uniforms.textures.value }
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