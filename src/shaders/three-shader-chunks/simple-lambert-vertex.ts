THREE.ShaderChunk.simple_lambert_vertex = `
	vec3 vLightFront, vLightBack;
	#include <beginnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <project_vertex>
	#include <lights_lambert_vertex>
`;
