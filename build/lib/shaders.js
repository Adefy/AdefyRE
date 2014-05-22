var precision, precision_declaration, varying_precision;

AREShader.shaders = {};

AREShader.shaders.wire = {};

AREShader.shaders.solid = {};

AREShader.shaders.texture = {};

precision = "mediump";

varying_precision = "mediump";

precision_declaration = "precision " + precision + " float;";

AREShader.shaders.wire.vertex = "" + precision_declaration + "\n\nattribute vec2 aPosition;\n\nuniform mat4 uProjection;\nuniform mat4 uModelView;\n\nvoid main() {\n  gl_Position = uProjection * uModelView * vec4(aPosition, 1, 1);\n}";

AREShader.shaders.wire.fragment = "" + precision_declaration + "\n\nuniform vec4 uColor;\nuniform float uOpacity;\n\nvoid main() {\n  vec4 frag = uColor;\n  frag.a *= uOpacity;\n  gl_FragColor = frag;\n}";

AREShader.shaders.solid.vertex = AREShader.shaders.wire.vertex;

AREShader.shaders.solid.fragment = "" + precision_declaration + "\n\nuniform vec4 uColor;\nuniform float uOpacity;\n\nvoid main() {\n  vec4 frag = uColor;\n  frag.a *= uOpacity;\n  gl_FragColor = frag;\n}";

AREShader.shaders.texture.vertex = "" + precision_declaration + "\n\nattribute vec2 aPosition;\nattribute vec2 aTexCoord;\n\nuniform mat4 uProjection;\nuniform mat4 uModelView;\n\nvarying " + varying_precision + " vec2 vTexCoord;\n\nvoid main() {\n  gl_Position = uProjection * uModelView * vec4(aPosition, 1, 1);\n  vTexCoord = aTexCoord;\n}";

AREShader.shaders.texture.fragment = "" + precision_declaration + "\n\nuniform sampler2D uSampler;\nuniform vec4 uColor;\nuniform float uOpacity;\nuniform vec4 uClipRect;\n\nvarying " + varying_precision + " vec2 vTexCoord;\n\nvoid main() {\n  vec4 baseColor = texture2D(uSampler,\n                             uClipRect.xy +\n                             vTexCoord * uClipRect.zw);\n  baseColor *= uColor;\n  baseColor.a *= uOpacity;\n\n  gl_FragColor = baseColor;\n}";
