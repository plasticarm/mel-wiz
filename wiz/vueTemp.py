import time

#Make sure we have a selection
numselected = CountSelectedObjects() 
numSel = str(numselected)

numselected = CountSelectedObjects() 

if numselected>1:
	message = "Please select only one object."
elif numselected<1:
	message = "Please Select A Terrain Object Before Running Script."

#Get the selected terrain info
sel = GetSelectedObjectByIndex(0)

#Prompt to set the size of the tiles and how many tiles
tileSize = Prompt('Terrain Tile Size: ','100.00', true, 'Size Of Terrain Tiles')
divideBy = Prompt('Divide Terrain By: ','2', true, 'Divide Terrain Into Tiles')
#estPolyCount = Prompt('Estimated Poly Count: ','100000', true, 'Estimated Poly Count From Export Options ')
quality = Prompt('Export Quality Setting: ','5', true, 'Export Quality Setting ( 1 - 10 ) ')

#Calculate sizes and positions
divBy = int(divideBy)
ts = float(tileSize)
div = float(divideBy)
#polyCount = float(estPolyCount)
move = ts * 2
tileTotal = divBy * divBy

#Calculate the size of the terrain tile by padding it based on quality and size
tScale = sel.GetScale();
q = float(quality)

factor = (10.0 - q) * 0.0015

#estPad = ts + (ts / (math.sqrt(polyCount / 3)) * 8)
estPad = (ts * factor) + ts
yScale = tScale[2]


#Prompt To Manually set padding
pad = Prompt('Estimated Padding : ', str(estPad), true, 'Apply Padding')
xScale = float(pad)
zScale = float(pad)

print("Export Tile Size = (tileSize * ((10 - quality) * 0.001)) + tileSize")
print(pad + " = (" + str(ts) + " * ((10 - " + str(q) + ") * 0.001)) + " + str(ts))

sel.SetTransformation([[xScale, 0.0, 0.0], [0.0, zScale, 0.0], [0.0, 0.0, yScale]])
print("SetTransformations : " + str(tScale))

xStart = 0 - ((ts * div) / 2)
zStart = xStart
xPos = xStart
zPos = xStart

pos = sel.Position()
#Put the terrain in the start position
sel.SetPosition(xPos, zPos, pos[2])

#Prompt for saving obj file
#dialog = DirDialog(None, "Choose a directory:", self.inFilepath, style = DD_DEFAULT_STYLE | DD_NEW_DIR_BUTTON)
fileDir = Prompt('Save Directory: ','/PasteDirectoryHere/', true, 'Directory')
if fileDir == "/PasteDirectoryHere/" :
	fileDir = "/Volumes/Workspace/TerrainTiles/"
	
fileNamePrefix = Prompt('File Name Prefix: ','TerrainName', true, 'File Name')

lodLevel = Prompt('LOD Level Number ( 0 Is Highest LOD ): ','0', true, 'LOD Level')

mes = ("Ready To Export : " + str(tileTotal) + " : Total Tiles\n")
mes += ("Current Position: " + str(pos[0]) + " : " + str(pos[1]) + " : " + str(pos[2]) + "\n" + "Start Position: X: " + str(xStart) + " Z: " + str(zStart) + " Y: " + str(pos[2]))
Message(mes)

mes = "Exporting Terrain Tiles: \n"
Refresh()
tileCount = tileTotal

#Move the terrain and export obj files
for z in range(0, divBy):
	for x in range(0, divBy):
		print("Refreshing Terrain\n")
		sel.SetPosition(xPos,zPos, pos[2])
	
		fileName = fileDir + fileNamePrefix + "_LOD" + lodLevel + "_X0" + str(x) + "_Z0" + str(z) + ".obj"
		print("Exporting Tile : " +  str(z) + str(x) + " : To File : " + fileName + "\n")
		Refresh()
		time.sleep(2)	
		
		didExport = ExportObject(fileName, false, "","","","")
		print("Finished Exported To File : " + fileName + "\n")
		xPos += move
		tileCount = tileCount - 1
		print("Tiles Left To Export : " + str(tileCount) + "\n")
		
	xPos = xStart
	zPos += move

#Reset
Refresh()
sel.SetPosition(pos[0], pos[1], pos[2])
mes = ("Terrain Successfully Exported Into " + str(tileTotal) + " Tiles")

Message(mes)
Refresh()


def getExportDir(self, event):
	dialog = wx.DirDialog(None, "Choose a directory to import from:",self.inFilepath, style = wx.DD_DEFAULT_STYLE | wx.DD_NEW_DIR_BUTTON)
	if dialog.ShowModal() == wx.ID_OK:
		self.inFilepath = dialog.GetPath()
		self.InFilePathText.SetLabel(self.inFilepath)
	dialog.Destroy()
	

