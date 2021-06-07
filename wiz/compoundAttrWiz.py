import maya.OpenMaya as om

def getCompoundAttr(node, attr):
	# The node name, and attribute name, to query:
	#node = "pPlaneShape1" 
	#attr = "uvSet"

	# Get an MObject by string name:
	selList = om.MSelectionList()
	selList.add(node)
	mObject = om.MObject()
	selList.getDependNode(0, mObject)

	# Attach a function set to the shape and get the plug to start querying:
	mFnDependencyNode = om.MFnDependencyNode(mObject)
	rootPlug = mFnDependencyNode.findPlug(attr)

	# Get all child plugs for our root, presuming it is a compound attr, since they're
	# the only type that have 'children':
	plugs = [rootPlug]
	for plug in plugs:
		# If the type is compound, and it is also set to array:
		if plug.isCompound() and plug.isArray():
			# Find the logical indices of the array:
			logicalIndices = om.MIntArray()
			plug.getExistingArrayAttributeIndices(logicalIndices)
			for i in range(logicalIndices.length()):
				# getExistingArrayAttributeIndices() can return negative index values
				# for some reason, so we need to be sure to *not* deal with those,
				# since obviously bad things would happen....
				if logicalIndices[i] >= 0:
					# Now find the element plug of that index, which is a compound
					# type attribute:
					elementPlug = plug.elementByLogicalIndex(logicalIndices[i])
					# And query the children of that compound attr:
					for j in range(elementPlug.numChildren()):
						plugs.append(elementPlug.child(j))
		# If it is compound, but not array:
		elif plug.isCompound():
			# Just get the children of that compound attr:
			for i in range(plug.numChildren()):
				plugs.append(plug.child(i))

	for plug in plugs:
		attrObj = plug.attribute() # MObject
		print plug.name(), attrObj.apiTypeStr()