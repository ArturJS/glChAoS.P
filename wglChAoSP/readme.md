# Experimental version of wglChAoS.P

It works only on webBrowsers with **WebGL 2.0** capabilities and support **webAssembly**: currently only **FireFox** and **Chrome** (or *Chromium based*) browsers, ***possibly updated***.

(Tested with FireFox >= 66 and Chrome >= 76 )

This version have last desktop **glChAoS.P** features: DualPass Accurate Rendering, Shadows and AmbientOcclusion, but use expensive WebGL 2.0 resource. And For this expensive use of resources are need  some browser settings: in general is need to disable **Angle** (DX9/DX11) and enable native **OpenGL** rendering.

This mostly in **Windows**: in **Linux** and **OS X** these settings *"should"* already be set.

### Firefox

In **about:config** url page, set:
 - webgl.disable-angle -> true
 - webgl.dxgl.enabled -> false

 If you note squared zones on smooth rendering areas, try: 
 - layers.acceleration.force-enabled -> true

 *it can happen mostly in Linux / OS X with some VideoCards/drivers*
 

### Chrome
In **chrome://flags** url page, set:
 - Choose ANGLE graphics backend -> OpenGL

 ## Live link [wglChAoS.P v.1.3.1](https://brutpitt.github.io/glChAoS.P/wglChAoSP/wglChAoSP.html?width=1024&height=1024&maxbuffer=10&lowprec=1&intbuffer=20&tabletmode=0&glowOFF=0&lightGUI=0&Attractor=Aizawa) *with some presets*
 

## Some screenshots

| ![](https://brutpitt.github.io/glChAoS.P/wglChAoSP/ssShot1.jpg) | ![](https://brutpitt.github.io/glChAoS.P/wglChAoSP/ssShot2.jpg)|
| :---: | :---: |
| ![](https://brutpitt.github.io/glChAoS.P/wglChAoSP/ssShot3.jpg) | ![](https://brutpitt.github.io/glChAoS.P/wglChAoSP/ssShot4.jpg)|


## Some notes
Although I use the fully WebGL feature, the generation phase remains on the CPU and currently works in single thread mode (only on WebGL), so some "objects" are very slow to built.

 Particularly **DLA3D** which use a kTree nanoflann external library (binary tree sort/search), and which is about 5/7 times slower

### **no tested on mobile devices*

## Flexible version [wglChAoS.P v.1.3.1](https://www.michelemorrone.eu/glchaosp/webGL.html) w/o AccurateRender/shadows/AO

More flexible (and tested) version that works with smartphones/tablets is ever available to same address, but which does not have AccurateRender/shadows/AO 


