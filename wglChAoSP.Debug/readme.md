# wglChAoS.P - Debug Page

This page is only for debug, and will delete in future

The problem was, (or better still is):
when I create a WebGL resource (I use Emscripten), I get a cumulative / progressive number, independently of the nature of the resource, like this one

- glCreateShader(GL_VERTEX_SHADER) -> ID = 1
- glCreateShader(GL_FRAGMENT_SHADER) -> ID = 2
- glCreateProgram(); -> ID = 3
- glGetUniformLocation(program, name) -> ID = 4
- glGenTextures(1, &texID) -> **ID = 5**

... for second shader ...

- glCreateShader(GL_VERTEX_SHADER) -> ID = 6
- glCreateShader(GL_FRAGMENT_SHADER) -> ID = 7
- glCreateProgram(); -> ID = 8
- glGetUniformLocation(program, name) -> ID = 9
- glGetUniformLocation(program, name2) -> ID = 10
- glGenTextures(1, &texID) -> **ID = 11**

and so on... 

I have **ONLY 12 textures** : 6 FrameBuffers (6 ColorAttach and 2 Depth) and only othe 4 textures, but at the end my 12th resource had ID = 46... far beyond the 32 permitted from D3D11
And this comportament is different from OpenGL, and also different from how I would have expected it.

I workaround moving the creation of any texture and FrameBuffers before any other resource.
A now the program works also with Angle D3D11.

**You can test the D3D11 debug version from this link: [wglChAoSP.Debug](https://brutpitt.github.io/glChAoS.P/wglChAoSP.Debug/wglChAoSP.html?width=1024&height=1024&maxbuffer=10&lowprec=1&intbuffer=20&tabletmode=0&glowOFF=0&lightGUI=0&Attractor=Hadley)**



### But there is just little other "visual" issue 

A spatial Glow filter (deNoise) looks different in two backends: 
- In Angle **OpenGL** backend the filter looks like the desktop version
- In Angle **D3D11** backend teh filter looks more sharpened with both **Chrome** and **Firefox**, and 16 & 32 bit framebuffer precision.

### You can see it directly from this link: [wglChAoSP.Debug](https://brutpitt.github.io/glChAoS.P/wglChAoSP.Debug/wglChAoSP.html?width=1024&height=1024&maxbuffer=10&lowprec=1&intbuffer=20&tabletmode=0&glowOFF=0&lightGUI=0&Attractor=MagneticRight)
