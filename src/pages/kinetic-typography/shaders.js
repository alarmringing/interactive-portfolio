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
	void main() {
		vec3 val = texture2D(uTexture, vUv).rgb;
		gl_FragColor = vec4(1. - val, 1.); // Inverts.
	}
`

export {vert, frag}