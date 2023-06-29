# define PI 3.141593

varying vec2 vUV;

uniform vec3 iResolution;
uniform float iTime;
uniform vec4 iMouse;

uniform float foldSymmetryIterations;
uniform float lineModulationIterations;
uniform float lineXModulationStrength;
uniform float lineYModulationStrength;
uniform float lineXModulationSpeed;
uniform float lineYModulationSpeed;
uniform float mouseFollowModifier;
uniform float rotationSpeed;
uniform float layers;
uniform float scaleSpeed;
uniform vec3 color;
uniform float highlightSize;
uniform float highlightSpeed;

mat2 Rot(float a) {
    float s = sin(a), c = cos(a);
    return mat2(c, -s, s, c);
}

float FluidLayer(vec2 uv, float gi) {
    // main inspiration: https://www.shadertoy.com/view/WtdXR8
    // license: unknown
    float t = iTime + gi * 253.234;
    float maxIter = lineModulationIterations + 1.;
    for (float i = 1.; i < maxIter; i++) {
        uv.x += .6 / i * cos(i * lineXModulationStrength * uv.y + t * lineXModulationSpeed);
        uv.y += .5 / i * cos(i * lineYModulationStrength * uv.x + t * lineYModulationSpeed);
    }
    
    return max(0., highlightSize / abs(sin(t * highlightSpeed - uv.x - uv.y)));
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = (fragCoord - .5 * iResolution.xy) / iResolution.y;
    vec2 M = (iMouse.xy - .5 * iResolution.xy) / iResolution.y;
    vec3 col = vec3(0.);
    
    uv += M * mouseFollowModifier;
    uv *= Rot(iTime * rotationSpeed);
    
    if (foldSymmetryIterations > 0.) {
        uv = abs(uv);
        float devider = 4.;
        for (float i = 1.; i < foldSymmetryIterations; i++) {
            uv *= Rot(PI / devider);
            uv = abs(uv);
            devider *= 2.;
        }
    }
    
    for (float i = 0., step = 1. / layers; i < 1.; i += step) {
        uv *= Rot(PI / 4.);
        float depth = fract(i + iTime * scaleSpeed);
        float fade = smoothstep(0., .2, depth) * smoothstep(1., .9, depth);
        float scale = mix(1., 15., depth);
        col += FluidLayer(uv * scale + i * 32432.3242, i) * fade * .8 * color;
    }
    
    fragColor = vec4(col, 1.0);
}

void main() {
  mainImage(gl_FragColor, vUV * iResolution.xy);
}
