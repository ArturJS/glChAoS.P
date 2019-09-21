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
} u;                    // 51*4 + APPLE

LAYUOT_BINDING(4) uniform _tMat {
    mat4 pMatrix;
    mat4 mvMatrix;
    mat4 mvpMatrix;
    mat4 mvLightM;
} m;

#if !defined(GL_ES) && !defined(__APPLE__)
    #define lightModelOFFSET 5
    subroutine float _lightModel(vec3 V, vec3 L, vec3 N);
    subroutine uniform _lightModel lightModel;
#else
    #define lightModelOFFSET 0
#endif

#define idxPHONG     (lightModelOFFSET    )
#define idxBLINPHONG (lightModelOFFSET + 1)
#define idxGGX       (lightModelOFFSET + 2)


float packColor16(vec2 color)
{
    return uintBitsToFloat( packUnorm2x16(color) );
}
vec2 unPackColor16(float pkColor)
{
    return unpackUnorm2x16(floatBitsToUint(pkColor));
}


#if !defined(GL_ES)

float packColor8(vec4 color)
{
    return uintBitsToFloat( packUnorm4x8(color) );
}
vec4 unPackColor8(float pkColor)
{
    return unpackUnorm4x8(floatBitsToUint(pkColor));
}
#endif

float getViewZ(float D)
{
    float denom = u.zFar-u.zNear;
    return (-2.0*u.zFar*u.zNear/denom) / (-(2. * D - 1.) + ((u.zFar+u.zNear)/denom));
    //return (pMatrix[3].z / (-(2.* D -1) - pMatrix[2].z));
}
float getViewZ_(float D)
{
    return -pow(2.0, (2. * D - 1.) * log2(u.zFar/u.zNear)) * u.zNear;
}

// linear depth (persective)
float depthSampleA(float Z)
{
    //float nonLinearDepth =  (zFar + zNear + 2.0 * zNear * zFar / linearDepth) / (zFar - zNear);
    float nonLinearDepth =  -(m.pMatrix[2].z + m.pMatrix[3].z / Z) * .5 +.5;
    return nonLinearDepth;
}

float getDepth(float Z) 
{
    float n = u.zNear, f = u.zFar;
    //return (( -Z * (f+n) - 2*f*n ) / (-Z * (f-n))  + 1.0) * .5; //non linear -> same of depthSample
    //return ( (- 2.f * depth - (f+n))/(f-n) + 1.0) * .5; // linearize + depthSample -> linear
    return ( ((u.zFar+u.zNear)/(u.zFar-u.zNear)) + ((2.0*u.zFar*u.zNear/(u.zFar-u.zNear)) / Z) ) * .5 + .5;

}

//https://stackoverflow.com/questions/18182139/logarithmic-depth-buffer-linearization/18187212#18187212
//https://outerra.blogspot.com/2012/11/maximizing-depth-buffer-range-and.html

float getDepth_(float Z)
{
    return (log2(1.+Z) * (2.0 / log2(u.zFar + 1.0)) -1.0) * Z;

}


float form_01_to_m1p1(float f)  { return 2. * f - 1.; }
float form_m1p1_to_01(float f)  { return  f*.5 + .5; }

#if !defined(__APPLE__)
LAYUOT_INDEX(idxPHONG) SUBROUTINE(_lightModel) 
#endif
float specularPhong(vec3 V, vec3 L, vec3 N)
{
    vec3 R = reflect(L, N);
    float specAngle = max(dot(R, V), 0.0);

    return pow(specAngle, u.lightShinExp * .25);
}

#if !defined(__APPLE__)
LAYUOT_INDEX(idxBLINPHONG) SUBROUTINE(_lightModel) 
#endif
float specularBlinnPhong(vec3 V, vec3 L, vec3 N)
{
    vec3 H = normalize(L - V);
    float specAngle = max(dot(H, N), 0.0);

    return pow(specAngle, u.lightShinExp);

}

#if !defined(__APPLE__)
LAYUOT_INDEX(idxGGX) SUBROUTINE(_lightModel) 
#endif
float specularGGX(vec3 V, vec3 L, vec3 N) 
{
    float alpha = u.ggxRoughness*u.ggxRoughness;
    float alphaSqr = alpha * alpha;

    vec3 H = normalize(L - V); // View = -
    float dotLH = max(0.0, dot(L,H));
    float dotNH = max(0.0, dot(N,H));
    float dotNL = max(0.0, dot(N,L));

    // D (GGX normal distribution)
    float denom = dotNH * dotNH * (alphaSqr - 1.0) + 1.0;
    float D = alphaSqr / (3.141592653589793 * denom * denom);

    // F (Fresnel term)
    float F = u.ggxFresnel + (1.0 - u.ggxFresnel) * pow(1.0 - dotLH, 5.0);
    float k = 0.5 * alpha;
    float k2 = k * k;

    return dotNL * D * F / (dotLH*dotLH*(1.0-k2)+k2);
}


vec4 getParticleNormal(vec2 coord)
{
    vec4 N;
    N.xy = (coord - vec2(.5))*2.0;  // diameter ZERO centred -> radius
    N.w = dot(N.xy, N.xy);          // magnitudo
    N.z = sqrt(1.0-N.w);            // Z convexity
    N.xyz = normalize(N.xyz); 
    
    return N;
}

vec3 getSimpleNormal(float z, sampler2D depthData)
{
    float gradA = getViewZ(texelFetch(depthData,ivec2(gl_FragCoord.xy + vec2( 1., 0.)), 0).w) - z;
    float gradB = getViewZ(texelFetch(depthData,ivec2(gl_FragCoord.xy + vec2( 0., 1.)), 0).w) - z;

    vec2 m = u.invScrnRes * -z;// * vec2(u.scrnRes.x/u.scrnRes.y * u.halfTanFOV, u.halfTanFOV);
    float invTanFOV = u.dpAdjConvex/u.halfTanFOV;

    vec3 N0 = cross(vec3(vec2( 1., 0.)*m, gradA*invTanFOV), vec3(vec2( 0., 1.)*m, gradB*invTanFOV));

    return normalize (N0);
}

vec3 getSelectedNormal(float z, sampler2D depthData)
{

    float gradA = getViewZ(texelFetch(depthData,ivec2(gl_FragCoord.xy + vec2( 1., 0.)), 0).w) - z;
    float gradB = getViewZ(texelFetch(depthData,ivec2(gl_FragCoord.xy + vec2( 0., 1.)), 0).w) - z;
    float gradC = z - getViewZ(texelFetch(depthData,ivec2(gl_FragCoord.xy + vec2(-1., 0.)), 0).w);
    float gradD = z - getViewZ(texelFetch(depthData,ivec2(gl_FragCoord.xy + vec2( 0.,-1.)), 0).w);

    vec2 m = u.invScrnRes * -z; //vec2(u.scrnRes.x/u.scrnRes.y * u.halfTanFOV, u.halfTanFOV);
    float invTanFOV = u.dpAdjConvex/u.halfTanFOV;

    vec3 V1 = abs(gradA-gradC)>u.dpNormalTune && abs(gradA)<abs(gradC) ? vec3(vec2( 1., 0.)*m, gradA*invTanFOV) : vec3(vec2(1., 0.)*m, gradC*invTanFOV);
    vec3 V2 = abs(gradB-gradD)>u.dpNormalTune && abs(gradB)<abs(gradD) ? vec3(vec2( 0., 1.)*m, gradB*invTanFOV) : vec3(vec2(0., 1.)*m, gradD*invTanFOV);
    vec3 N0 = cross(V1, V2);


    return normalize (N0);
}

#define RENDER_AO uint(1)
#define RENDER_DEF uint(2)
#define RENDER_SHADOW uint(4)

LAYUOT_BINDING(1) uniform sampler2D tex;

#define pixelColorOFFSET 0
#define idxBLENDING (pixelColorOFFSET    )
#define idxSOLID    (pixelColorOFFSET + 1)
#define idxSOLID_AO (pixelColorOFFSET + 2)
#define idxSOLID_DR (pixelColorOFFSET + 3)

#if !defined(GL_ES) && !defined(__APPLE__)
    subroutine vec4 _pixelColor(vec4 color, vec4 N);
    subroutine uniform _pixelColor pixelColor;
#endif

in vec4 mvVtxPos;

in float pointDistance;
in vec4 particleColor;
in float particleSize;

//in vec4 shadowlightView;

layout (location = 0) out vec4 outColor;


float luminance(vec3 c) { return dot(c, vec3(0.2990, 0.5870, 0.1140)); }

float getAlpha(float alpha)
{

    CONST float alphaAtten = exp(-0.1*sign(pointDistance)*pow(abs(pointDistance+1.f)+1.f, u.alphaDistAtten*.1));
    return clamp(alpha * alphaAtten * u.alphaK, 0.0, 1.0);

}

vec4 acquireColor(vec2 coord)
{
    if(pointDistance<u.clippingDist) discard;    

    vec4 color = particleColor * texture(tex, coord).r;

    return vec4(color.rgb * u.colIntensity, getAlpha(color.a)) ;
}


vec4 newVertex;

vec3 packing2Colors16bit(vec3 colorA, vec3 colorB)
{
    return vec3(packColor16(colorA.rg),
                packColor16(vec2(colorA.b, colorB.r)),
                packColor16(colorB.gb));
}

#if !defined(GL_ES)
vec3 packing2Colors8bit(vec3 colorA, vec3 colorB)
{
    return vec3(packColor8(vec4(0.0,colorA.rgb)),
                packColor8(vec4(0.0,colorB.rgb)), 0.0);
}
#endif

#if !defined(__APPLE__)
LAYUOT_INDEX(idxSOLID) SUBROUTINE(_pixelColor) 
#endif
vec4 pixelColorDirect(vec4 color, vec4 N)
{
        vec3 light =  normalize(u.lightDir);  // +vtx
    
        float lambertian = max(0.0, dot(light, N.xyz)); 

        vec3 V = normalize(newVertex.xyz);
#if defined(GL_ES) || defined(__APPLE__)
        float specular = u.lightModel == uint(idxPHONG) ? specularPhong(V, light, N.xyz) : (u.lightModel == uint(idxBLINPHONG) ? specularBlinnPhong(V, light, N.xyz) : specularGGX(V, light, N.xyz));
#else
        float specular = lightModel(V, light, N.xyz);
#endif

        vec3 lightColor = color.rgb * u.lightColor * lambertian * u.lightDiffInt +  //diffuse component
                        u.lightColor * specular * u.lightSpecInt;

        vec3 ambColor = (color.rgb*u.lightAmbInt + vec3(u.lightAmbInt)) * .5;

        return vec4(smoothstep(u.sstepColorMin, u.sstepColorMax, lightColor + ambColor) , color.a);
}

#if !defined(__APPLE__)
LAYUOT_INDEX(idxSOLID_AO) SUBROUTINE(_pixelColor) 
#endif
vec4 pixelColorAO(vec4 color, vec4 N)
{
        vec3 light =  normalize(u.lightDir);  // +vtx
    
        float lambertian = max(0.0, dot(light, N.xyz)); 

        vec3 V = normalize(newVertex.xyz);
#if defined(GL_ES) || defined(__APPLE__)
        float specular = u.lightModel == uint(idxPHONG) ? specularPhong(V, light, N.xyz) : (u.lightModel == uint(idxBLINPHONG) ? specularBlinnPhong(V, light, N.xyz) : specularGGX(V, light, N.xyz));
#else
        float specular = lightModel(V, light, N.xyz);
#endif

        vec3 lColor =  color.rgb * u.lightColor * lambertian * u.lightDiffInt +  //diffuse component
                       u.lightColor * specular * u.lightSpecInt;

        return vec4(packing2Colors16bit(lColor, color.rgb), getDepth(newVertex.z));
}

#if !defined(__APPLE__)
LAYUOT_INDEX(idxSOLID_DR) SUBROUTINE(_pixelColor)
#endif
vec4 pixelColorDR(vec4 color, vec4 N)
{
   return vec4(color.xyz, getDepth(newVertex.z));
}


#if !defined(__APPLE__)
LAYUOT_INDEX(idxBLENDING) SUBROUTINE(_pixelColor)  
#endif
vec4 pixelColorBlending(vec4 color, vec4 N)
{
    if(color.a < u.alphaSkip ) { discard; return color; }
    else return color;
}

vec4 mainFunc(vec2 ptCoord)
{

    vec4 N = getParticleNormal(ptCoord);
    if(N.w >= 1.0 || N.z < u.alphaSkip) { discard; return vec4(0.0); } //return black color and max depth

    newVertex    = mvVtxPos + vec4(0., 0., N.z * particleSize, 0.);

//linear
    gl_FragDepth = getDepth(newVertex.z);
    //gl_FragDepth = depthSample(newVertex.z); // same but with zNear & zFar
//logarithmic
    //vec4 pPos = m.pMatrix * newVertex;
    //gl_FragDepth = getDepth_(pPos.w);
//Outerra
    //vec4 pPos = m.pMatrix * newVertex;
    //gl_FragDepth =  getDepth_(pPos.w+1.);

    vec4 color = acquireColor(ptCoord);

#if defined(GL_ES) || defined(__APPLE__)
    #if defined(GL_ES) && !defined(GLCHAOSP_LIGHTVER_EXPERIMENTAL)
        return u.lightActive==uint(1) ? pixelColorDirect(color, N) : pixelColorBlending(color, N);
    #else        
        switch(u.renderType) {
            default:
            case uint(0) : return pixelColorBlending(color, N);
            case uint(1) : return pixelColorDirect(color, N);
            case uint(2) : return pixelColorAO(color, N);
            case uint(3) : return pixelColorDR(color, N);             
        }
        //return (u.pass >= uint(2)) ? vec4(color.xyz, getDepth(newVertex.z)) : (u.pass==uint(0) ? retColor : vec4(retColor.xyz, getDepth(newVertex.z))); 
    #endif
#else                          
        return pixelColor(color, N); 
#endif
}

void main()
{

    vec2 ptCoord = vec2(gl_PointCoord.x,1.0-gl_PointCoord.y); //upsideDown: revert point default
    outColor = mainFunc(ptCoord);
}
