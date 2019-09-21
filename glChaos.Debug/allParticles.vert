#version 450
////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2018-2019 Michele Morrone
//  All rights reserved.
//
//  mailto:me@michelemorrone.eu
//  mailto:brutpitt@gmail.com
//  
//  https://github.com/BrutPitt
//
//  https://michelemorrone.eu
//  https://BrutPitt.com
//
//  This software is distributed under the terms of the BSD 2-Clause license
//  
////////////////////////////////////////////////////////////////////////////////
#line 17    //#version dynamically inserted
#define LAYUOT_BINDING(X) layout (binding = X)
#define LAYUOT_INDEX(X) layout(index = X)
#define SUBROUTINE(X) subroutine(X)
#define CONST const


layout(std140) uniform;

layout (location = 0) in vec4 a_ActualPoint;

LAYUOT_BINDING(0) uniform sampler2D paletteTex;

LAYUOT_BINDING(2) uniform _particlesData {
    vec3  lightDir;          // align 0
    float lightDiffInt;
    vec3  lightColor;        // align 16
    float lightSpecInt;
    vec4  POV;
    vec2  scrnRes;
    vec2  invScrnRes;
    float lightAmbInt ;
    float lightShinExp;
    float sstepColorMin;
    float sstepColorMax;
    float pointSize;
    float pointDistAtten;
    float alphaDistAtten;
    float alphaSkip;
    float alphaK;
    float colIntensity;
    float clippingDist;
    float zNear;
    float zFar;
    float halfTanFOV;
    float velIntensity;
    float ySizeRatio;
    float ptSizeRatio;
    float pointspriteMinSize;
    float ggxRoughness;
    float ggxFresnel;
    float shadowSmoothRadius;
    float shadowGranularity;
    float shadowBias;
    float shadowDarkness;
    float aoRadius;
    float aoBias;
    float aoDarkness;
    float aoMul;
    float aoModulate;
    float aoStrong;
    float dpAdjConvex;
    float dpNormalTune;
    uint  lightModel;
    uint  lightActive;
    uint  pass;
    uint  renderType;
} u;

LAYUOT_BINDING(4) uniform _tMat {
    mat4 pMatrix;
    mat4 mvMatrix;
    mat4 mvpMatrix;
    mat4 mvLightM;
} m;

#ifndef GL_ES
out gl_PerVertex
{
    vec4 gl_Position;
    float gl_PointSize;
    //float gl_ClipDistance[1];
};
#endif


#ifndef GL_ES
    subroutine vec4 _colorResult();
    subroutine uniform _colorResult colorResult;
#endif

// Load OBJ
#ifndef GL_ES
LAYUOT_INDEX(1) SUBROUTINE(_colorResult) vec4 objColor()
{
    uint packCol = floatBitsToUint(a_ActualPoint.w);
    vec4 col = unpackUnorm4x8(packCol);

    return col;
}
#endif

LAYUOT_INDEX(0) SUBROUTINE(_colorResult) vec4 velColor()
{
    float vel = a_ActualPoint.w*u.velIntensity;
    return vec4(texture(paletteTex, vec2(vel,0.f)).rgb,1.0);
}

out vec4 mvVtxPos;
#ifdef SHADOW_PASS
out vec4 solidVtx;
#endif
out float pointDistance;
out vec4 particleColor;
out float particleSize;


void main()
{


#ifdef SHADOW_PASS
    vec4 vtxPos =  m.mvLightM  * vec4(a_ActualPoint.xyz,1.f);
    solidVtx = m.mvMatrix * vec4(a_ActualPoint.xyz,1.f);
#else
    vec4 vtxPos = m.mvMatrix * vec4(a_ActualPoint.xyz,1.f);
#endif

    #if defined(GL_ES) || defined(TEST_WGL)
        particleColor = velColor();
    #else
        particleColor = colorResult();
    #endif
    gl_Position = m.pMatrix * vtxPos;

    mvVtxPos = vec4(vtxPos.xyz,1.0);

    pointDistance = gl_Position.w; //length(vtxPos.w);

    float ptAtten = exp(-0.01*sign(pointDistance)*pow(abs(pointDistance)+1.f, u.pointDistAtten*.1));
    float size = u.pointSize * ptAtten * u.ySizeRatio;
    particleSize = size*u.invScrnRes.y;

    vec4 pt  = m.pMatrix * vec4(vtxPos.xy + vec2(size) * u.ptSizeRatio , vtxPos.zw);

    // NVidia & Intel do not supports gl_PointSize<1.0 -> point disappear
    // AMD driver (some times) supports gl_PointSize from 0.1
    // Look in Info dialog: point Range and Granularity
    gl_PointSize = max(distance(gl_Position.xyz, pt.xyz)/max(abs(gl_Position.w),.0001), u.pointspriteMinSize);

//    float fc = .5 * log2(u.zFar+1);
//    gl_Position.z = gl_Position.w * (log2( max(.000001, 1.+gl_Position.w) ) * fc - 1.);
}
