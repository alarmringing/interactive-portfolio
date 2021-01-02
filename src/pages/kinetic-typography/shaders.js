const vert = `
	out vec2 vUv;
	out vec3 vPos;
	void main() {
		vUv = uv;
		vPos = position;
		gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
	}
`

const frag = `
	in vec2 vUv;
	in vec3 vPos;
	uniform sampler2D uTexture;
	//uniform vec4 uBkgColor;
	uniform float uTime;

	void main() {
		float time = uTime * 0.2;
		vec2 repeat = vec2(5., 4.);
		vec2 uv = fract(vUv * repeat + vec2(time, 0));

		float shadow = pow(clamp(clamp(vPos.z / 5., 0., 1.)+0.1, 0., 1.), 0.3);

		vec3 val = texture(uTexture, uv).rgb;
		//val *= vec3(uv.x, uv.y, 1.); // This is to test if UVs are correct.

		gl_FragColor = vec4(val*shadow, 1.); // Inverts.
	}
`

export {vert, frag}