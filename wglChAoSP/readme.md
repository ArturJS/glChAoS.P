# Experimental version of wglChAoS.P v.1.3.1

It works only on webBrowsers with **WebGL 2.0** capabilities and support **webAssembly**: currently only **FireFox** and **Chrome** (or *Chromium based*) browsers, ***possibly updated*** - (Tested with FireFox >= 66 and Chrome >= 76 )

## IMPORTANT - Windows Users - required settings
This version have last desktop **glChAoS.P** features: DualPass Accurate Rendering, Shadows and AmbientOcclusion, but use expensive WebGL 2.0 resource and for this are necessary some browser settings:

In general is need to disable **Angle** (DX9/DX11) and enable native **OpenGL** rendering.

### FireFox settings - Windows

From **about:config** url page:
 - webgl.disable-angle -> true
 - webgl.dxgl.enabled -> false
 
 **For Linux and OS X these options are irrilevants: they work anyway*
 
### Chrome settings - Windows 

From **chrome://flags** url page:

 - Choose ANGLE graphics backend -> OpenGL

**For Linux and OS X this option do not exist*

### Linux / OS X
 
 **FireFox** - only if you note squared zones on smooth rendering areas, try: 
 - layers.acceleration.force-enabled -> true

 <p>&nbsp;<br></p>





  ## Start wglChAoS.P v.1.3.1 Experimental
- From main page: **[wglChAoS.P v.1.3.1 Experimental](https://www.michelemorrone.eu/glchaosp/webGL.html)** - can select canvas size and other parameters 
  - need to flag *"Experimental"* check
- Directly with some presets: **[wglChAoS.P v.1.3.1 Experimental](https://brutpitt.github.io/glChAoS.P/wglChAoSP/wglChAoSP.html?width=1024&height=1024&maxbuffer=10&lowprec=1&intbuffer=20&tabletmode=0&glowOFF=0&lightGUI=0&Attractor=Aizawa)**

<p>&nbsp;<br></p>


## Some screenshots

| ![](https://brutpitt.github.io/glChAoS.P/wglChAoSP/ssShot1.jpg) | ![](https://brutpitt.github.io/glChAoS.P/wglChAoSP/ssShot2.jpg)|
| :---: | :---: |
| ![](https://brutpitt.github.io/glChAoS.P/wglChAoSP/ssShot3.jpg) | ![](https://brutpitt.github.io/glChAoS.P/wglChAoSP/ssShot4.jpg)|
<p>&nbsp;<br></p>


## Performance notes
Although I use the fully WebGL feature, the generation phase remains on the CPU and currently works in single thread mode (for the WebGL version), so some "objects" are very slow to built.

 Particularly **DLA3D** which use a kTree nanoflann external library (binary tree sort/search), and which is about 5/7 times slower respect desktop version

### **Experimental is still not tested on mobile devices*



