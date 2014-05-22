AREShader.shaders = {}
AREShader.shaders.wire = {}
AREShader.shaders.solid = {}
AREShader.shaders.texture = {}

#precision = "highp"
precision = "mediump"
varying_precision = "mediump"
precision_declaration = "precision #{precision} float;"

AREShader.shaders.wire.vertex = """
#{precision_declaration}

attribute vec2 aPosition;

uniform mat4 uProjection;
uniform mat4 uModelView;

void main() {
  gl_Position = uProjection * uModelView * vec4(aPosition, 1, 1);
}
"""

AREShader.shaders.wire.fragment = """
#{precision_declaration}

uniform vec4 uColor;
uniform float uOpacity;

void main() {
  vec4 frag = uColor;
  frag.a *= uOpacity;
  gl_FragColor = frag;
}
"""

## Shaders for shapes with solid colors
AREShader.shaders.solid.vertex = AREShader.shaders.wire.vertex

AREShader.shaders.solid.fragment = """
#{precision_declaration}

uniform vec4 uColor;
uniform float uOpacity;

void main() {
  vec4 frag = uColor;
  frag.a *= uOpacity;
  gl_FragColor = frag;
}
"""

## Shaders for textured objects
AREShader.shaders.texture.vertex = """
#{precision_declaration}

attribute vec2 aPosition;
attribute vec2 aTexCoord;

uniform mat4 uProjection;
uniform mat4 uModelView;

varying #{varying_precision} vec2 vTexCoord;

void main() {
  gl_Position = uProjection * uModelView * vec4(aPosition, 1, 1);
  vTexCoord = aTexCoord;
}
"""

AREShader.shaders.texture.fragment = """
#{precision_declaration}

uniform sampler2D uSampler;
uniform vec4 uColor;
uniform float uOpacity;
uniform vec4 uClipRect;

varying #{varying_precision} vec2 vTexCoord;

void main() {
  vec4 baseColor = texture2D(uSampler,
                             uClipRect.xy +
                             vTexCoord * uClipRect.zw);
  baseColor *= uColor;
  baseColor.a *= uOpacity;

  gl_FragColor = baseColor;
}
"""
