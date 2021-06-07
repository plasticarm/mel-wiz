print("Testing\n")
numselected = CountSelectedObjects()
print("Selected Object Count : " + str(numselected))
	
sel = GetSelectedObjectByIndex(0)
 
size = (10.0 * 5.0) * 0.001
print("Size : " + str(size))

if sel.IsTerrain() == False :
	print("IsTerrain : False")
else:
	print("IsTerrain : True")
	TerrainObj = sel.ToTerrain()
	
if sel.IsInfiniteParametricTerrain() == True :
	print("IsInfiniteParametricTerrain : True")
else:
	print("IsInfiniteParametricTerrain : False")

if sel.IsInfinitePlane() == True :
	print("IsInfinitePlane : True")
else:
	print("IsInfinitePlane : False")

if sel.IsPlanet() == True :
	print("IsPlanet : True")
else:
	print("IsPlanet : False")
	
if sel.IsPythonObject() == True :
	print("IsPythonObject : True")
else:
	print("IsPythonObject : False")
	
if sel.IsBooleanOperation() == True :
	print("IsBooleanOperation : True")
else:
	print("IsBooleanOperation : False")
	
if sel.IsGroup() == True :
	print("IsGroup : True")
else:
	print("IsGroup : False")
	
if sel.IsHyperMesh() == True :
	print("IsHyperMesh : True")
else:
	print("IsHyperMesh : False")

print("Name : " + str(sel.Name()))
print("Position : " + str(sel.Position()))
print("Scale : " + str(sel.GetScale()))

print("GetTransformations : " + str(sel.GetTransformation()))
t = sel.GetTransformation()
print("X : " + str(t[0]))
newT = [[100.0, 0.0, 0.0], [0.0, 100.0, 0.0], [0.0, 0.0, 100.0]]
sel.SetTransformation([[100.0, 0.0, 0.0], [0.0, 100.0, 0.0], [0.0, 0.0, 100.0]])
print("New - GetTransformations : " + str(sel.GetTransformation()))

print("ToTerrain : " + str(sel.ToTerrain()))
print("ToMeshObject : " + str(sel.ToMeshObject()))

print("Type : " + str(sel.Type()))

print("GetAggregate : " + str(sel.GetAggregate()))
print("ToGroup : " + str(sel.ToGroup()))

scale = sel.GetScale()

#terrainObj = sel.ToTerrain()
#print("TerrainObj : " + str(terrainObj))
#height = terrainObj.Height()
#width= terrainObj.Width()
#print("Terrain Height : " + str(height) + " Width : " + str(width))

