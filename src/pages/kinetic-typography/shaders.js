const vert = `
	out vec2 vUv;
	void main() {
		vUv = uv;
		gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
	}
`

const frag = `
	in vec2 vUv;
	uniform sampler2D uTexture;
	uniform float uTime;

	void main() {
		float time = uTime * 0.75;
		vec2 repeat = vec2(2., 6.);
		vec2 uv = fract(vUv * repeat + vec2(-time, 0));

		vec3 val = texture(uTexture, uv).rgb;
		// val *= vec3(uv.x, uv.y, 1.); // This is to test if UVs are correct.

		gl_FragColor = vec4(1.-val, 1.); // Inverts.
	}
`

export {vert, frag}