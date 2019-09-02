# Experimental version of wglChAoS.P

It works only on webBrowsers with **WebGL 2.0** capabilities and support **webAssembly**: currently only **FireFox** and **Chrome** (or *Chromium based*) browsers, possibly updated.

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

## Some screenshots

| ![](https://brutpitt.github.io/glChAoS.P/wglChAoSP/ssShot1.jpg) | ![](https://brutpitt.github.io/glChAoS.P/wglChAoSP/ssShot2.jpg)|
| :---: | :---: |
| ![](https://brutpitt.github.io/glChAoS.P/wglChAoSP/ssShot3.jpg) | ![](https://brutpitt.github.io/glChAoS.P/wglChAoSP/ssShot4.jpg)|

### **no tested on mobile devices*