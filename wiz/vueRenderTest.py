selCam = SelectByName("Top Camera")
#cam = selCam.ToCamera()
SwitchCamera(1)
Render()
SaveDepthMap("/Shared3/projects/FutureSpace-GJ/images/Pluto/PlutoMultipassTest_Z DepthTest1.exr")


selCam = SelectByName("Top View")
SwitchCamera(1)
