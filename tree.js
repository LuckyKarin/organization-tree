function Tree(options){
    this.containerId = options.containerId || "";
    this.svgId = options. svgId || "";
    this.itemWidth = options.itemWidth || 180;
    this.itemHeight = options.itemHeight || 32;
    this.itemWidthHorizontal = options.itemWidthHorizontal || 146;
    this.itemHeightHorizontal = options.itemHeightHorizontal || 50;
    this.totalHeight = 0;
    this.totalWidth = 0;
}

Tree.prototype = {
    draw: function(data){
        this.totalWidth = 0;
        var infoData = this._setNodesInfo(data);
        var widthData = this._setNodesWidth(data);
        var svgContainer = document.getElementById(this.svgId);
        var container = document.getElementById(this.containerId);
        container.innerHTML = "";
        svgContainer.innerHTML = "";
        this._putNodesPoi(infoData, data);
        if(data.display == 0){
            container.parentNode.style.minWidth = infoData.width + 40 + "px";
            container.parentNode.style.minHeight = 0;
            svgContainer.setAttribute("width", infoData.width);
            svgContainer.setAttribute("height", this.totalHeight);
        }else if(data.display == 1){
            container.parentNode.style.minWidth = this.totalWidth + 180 + "px";
            container.parentNode.style.minHeight = infoData.width + "px";
            svgContainer.setAttribute("height", infoData.width);
            svgContainer.setAttribute("width", this.totalWidth);
        }
        this._drawNodesLine(infoData, svgContainer, data.display);       
    },
    clear: function(){
        var svgContainer = document.getElementById(this.svgId);
        var container = document.getElementById(this.containerId);
        svgContainer.innerHTML = "";
        container.innerHTML = "";
        svgContainer.setAttribute("height", 0);
        svgContainer.setAttribute("width", 0);
        container.parentNode.style.minWidth = 0;
        container.parentNode.style.minHeight = 0;
    },
    //计算每个节点的路径数组path，子节点个数number，层级level。 初始化所有宽度为undefined。
    _setNodesInfo: function(data){
        var newData = data;
        newData.path = [];
        newData.number = data.nodes ?  data.nodes.length : 0;
        newData.level = 0;
        newData.width = undefined;
        this._setSingleNodesInfo(newData);
        return newData;
    },
    _setSingleNodesInfo: function(data){
        for(var i=0; i<data.nodes.length; i++){
            var path = data.path.slice(0);   //复制path数组
            path.push(i);
            data.nodes[i].path = path;
            data.nodes[i].number = data.nodes[i].nodes ? data.nodes[i].nodes.length : 0;
            data.nodes[i].level = data.level + 1;
            data.nodes[i].width = undefined;
            if(data.nodes[i].nodes && data.nodes[i].nodes.length > 0){
                this._setSingleNodesInfo(data.nodes[i]);
            }
        }
    },
    //计算每个节点需要的宽度空间
    _setNodesWidth: function(data){
        var newData = data;
        var display = data.display;
        while(true){
            if(newData.width > 0){
                return data;
            }else{
                this._setSingleNodeWidth(data, display);
            }
        }
        return newData;
    },
    _setSingleNodeWidth: function(obj, display){
        if(!obj.collapse && obj.nodes && obj.nodes.length > 0){
            obj.width = 0;
            for(var i=0; i<obj.nodes.length; i++){
                obj.width = obj.width + obj.nodes[i].width;
                this._setSingleNodeWidth(obj.nodes[i], display);
            }
        }else if(obj.collapse && obj.nodes && obj.nodes.length > 0){
            if(display == 0){
                obj.width = this.itemWidth;
            }else if(display == 1){
                obj.width = this.itemHeightHorizontal;
            }
            for(var i=0; i<obj.nodes.length; i++){
                this._setSingleNodeWidth(obj.nodes[i], display);
            }
        }else{
            if(display == 0){
                obj.width = this.itemWidth;
            }else if(display == 1){
                obj.width = this.itemHeightHorizontal;
            }
        }
    },
    _putNodesPoi: function(obj, mainData){
        this._putSingleNodePoi(obj, mainData);
        if(!obj.collapse && obj.nodes && obj.nodes.length > 0){
            for(var i=0; i<obj.nodes.length; i++){
                this._putNodesPoi(obj.nodes[i], mainData);
            }
        }
    },
    _putSingleNodePoi: function(obj, mainData){
        var container = document.getElementById(this.containerId);
        var newDiv = document.createElement("div");
        var newNameSpan = document.createElement("span");
        newDiv.className = "editNode";
        newDiv.setAttribute("_pk", obj.pk);
        newDiv.setAttribute("_level", obj.level);
        newNameSpan.className = "editNodeName";
        newNameSpan.innerHTML = obj.name;
        newDiv.appendChild(newNameSpan);
        
        if(mainData.display == 0){
            newDiv.style.top = obj.level * this.itemHeight * 2 + "px";
            if(obj.level * this.itemHeight * 2 + this.itemHeight > this.totalHeight){
                this.totalHeight = obj.level * this.itemHeight * 2 + this.itemHeight;
            }
            container.appendChild(newDiv);
            var left = 0;
            if(obj.path.length == 0){
                left = obj.width/2 - parseInt(newDiv.clientWidth)/2;
                newDiv.setAttribute("_id", "root");
            }else{
                var parent;
                var parentPath;
                if(obj.path.length == 1){
                    parentPath = [];
                    parent = document.querySelector("#" + this.containerId + " [_id='root']");
                }else{
                    parentPath = obj.path.slice(0, obj.path.length - 1);
                    parent = this._getNodeElemByPath(parentPath);
                }
                //the first one
                if(obj.path[obj.level - 1] == 0){
                    //parent is the root node
                    if(parentPath.length == 0){
                        left = parseInt(parent.style.left) - mainData.width/2 + obj.width/2;
                    //parent is not the root node
                    }else{
                        left = parseInt(parent.style.left) - this._getNodeBypath(mainData, parentPath).width/2 + obj.width/2;
                    }
                //after the first one
                }else{
                    var lastSiblingPath = obj.path.slice(0);
                    lastSiblingPath[obj.level - 1] = obj.path[obj.level - 1] - 1;
                    var lastSibling = this._getNodeElemByPath(lastSiblingPath);
                    left = parseInt(lastSibling.style.left) + this._getNodeBypath(mainData, lastSiblingPath).width/2 + obj.width/2;
                }
                newDiv.setAttribute("_id",obj.path.join("_"));
            }
            newDiv.style.left = left + "px";
        }else if(mainData.display == 1){
            newDiv.style.left = (obj.level * this.itemHeight + obj.level * this.itemWidthHorizontal) + "px";
            if(obj.level * this.itemHeight + obj.level * this.itemWidthHorizontal > this.totalWidth){
                this.totalWidth = obj.level * this.itemHeight + obj.level * this.itemWidthHorizontal + this.itemWidthHorizontal;
            }
            container.appendChild(newDiv);
            var top = 0;
            if(obj.path.length == 0){
                top = obj.width/2 - parseInt(newDiv.clientHeight)/2;
                newDiv.setAttribute("_id", "root");
            }else{
                var parent;
                var parentPath;
                if(obj.path.length == 1){
                    parentPath = [];
                    parent = document.querySelector("#" + this.containerId + " [_id='root']");
                }else{
                    parentPath = obj.path.slice(0, obj.path.length - 1);
                    parent = this._getNodeElemByPath(parentPath);
                }
                //the first one
                if(obj.path[obj.level - 1] == 0){
                    //parent is the root node
                    if(parentPath.length == 0){
                        top = parseInt(parent.style.top) - mainData.width/2 + obj.width/2;
                    //parent is not the root node
                    }else{
                        top = parseInt(parent.style.top) - this._getNodeBypath(mainData, parentPath).width/2 + obj.width/2;
                    }
                //after the first one
                }else{
                    var lastSiblingPath = obj.path.slice(0);
                    lastSiblingPath[obj.level - 1] = obj.path[obj.level - 1] - 1;
                    var lastSibling = this._getNodeElemByPath(lastSiblingPath);
                    top = parseInt(lastSibling.style.top) + this._getNodeBypath(mainData, lastSiblingPath).width/2 + obj.width/2;
                }
                newDiv.setAttribute("_id",obj.path.join("_"));
            }
            newDiv.style.top = top + "px";
        }
    },
    _drawNodesLine: function(obj, svgContainer, display){
        this._drawSingleNodeLine(obj, svgContainer, display);
        if(!obj.collapse && obj.nodes && obj.nodes.length > 0){
            for(var i=0; i<obj.nodes.length; i++){
                this._drawNodesLine(obj.nodes[i], svgContainer, display);
            }
        }
    },
    _drawSingleNodeLine: function(obj, svgContainer, display){
        if(!obj.collapse && obj.nodes && obj.nodes.length > 0){
            var objElem;
            if(obj.path.length == 0){
                objElem = document.querySelector("#" + this.containerId + " [_id='root']");
            }else{
                objElem = this._getNodeElemByPath(obj.path);
            }
            if(display == 0){
                var beginX = parseInt(objElem.style.left) + objElem.clientWidth/2;
                var beginY = parseInt(objElem.style.top) + objElem.clientHeight;
                for(var i=0; i<obj.nodes.length; i++){
                    var nodeElem = this._getNodeElemByPath(obj.nodes[i].path);
                    var node1X = beginX;
                    var node1Y = beginY + this.itemHeight/2;
                    var node2X = parseInt(nodeElem.style.left) + nodeElem.clientWidth/2;
                    var node2Y = node1Y;
                    var node3X = node2X;
                    var node3Y = parseInt(nodeElem.style.top);
                    var linePoints = beginX + "," + beginY + " " + node1X + "," + node1Y + " " + node2X + "," + node2Y + " " + node3X + "," + node3Y;
                    var xmlns = "http://www.w3.org/2000/svg";
                    var line = document.createElementNS(xmlns, "polyline");
                    var circle = document.createElementNS(xmlns, "circle");
                    line.setAttributeNS(null, "points", linePoints);
                    line.setAttributeNS(null, "style", "fill:transparent;stroke:#c4c3c2;stroke-width:1.2");
                    circle.setAttributeNS(null, "cx", node3X);
                    circle.setAttributeNS(null, "cy", node3Y);
                    circle.setAttributeNS(null, "r",  3);
                    circle.setAttributeNS(null, "style", "fill:#eeeeee;stroke:#c4c3c0;stroke-width:1");
                    svgContainer.appendChild(line);
                    svgContainer.appendChild(circle);
                }
            }else if(display == 1){
                var beginX = parseInt(objElem.style.left) + objElem.clientWidth;
                var beginY = parseInt(objElem.style.top) + objElem.clientHeight/2;
                for(var i=0; i<obj.nodes.length; i++){
                    var nodeElem = this._getNodeElemByPath(obj.nodes[i].path);
                    var node1X = beginX + this.itemHeight/2;
                    var node1Y = beginY;
                    var node2X = node1X;
                    var node2Y = parseInt(nodeElem.style.top) + nodeElem.clientHeight/2;
                    var node3X = parseInt(nodeElem.style.left);
                    var node3Y = node2Y;
                    var linePoints = beginX + "," + beginY + " " + node1X + "," + node1Y + " " + node2X + "," + node2Y + " " + node3X + "," + node3Y;
                    var xmlns = "http://www.w3.org/2000/svg";
                    var line = document.createElementNS(xmlns, "polyline");
                    var circle = document.createElementNS(xmlns, "circle");
                    line.setAttributeNS(null, "points", linePoints);
                    line.setAttributeNS(null, "style", "fill:transparent;stroke:#c4c3c2;stroke-width:1.2");
                    circle.setAttributeNS(null, "cx", node3X);
                    circle.setAttributeNS(null, "cy", node3Y);
                    circle.setAttributeNS(null, "r",  3);
                    circle.setAttributeNS(null, "style", "fill:#eeeeee;stroke:#c4c3c0;stroke-width:1");
                    svgContainer.appendChild(line);
                    svgContainer.appendChild(circle);
                }
            }
        }
    },
    _getNodeBypath: function(data,pathArray){
        var nodeData = data;
        if(pathArray.length > 0){
            for(var i=0; i<pathArray.length; i++){
                nodeData = nodeData.nodes[pathArray[i]];
            }
        }
        return nodeData;
    },
    _getNodeById: function(data, id){
        if(data.pk == id){
            return data;
        }else{
            for(var i=0; i<data.nodes.length; i++){
                var node = this._getNodeById(data.nodes[i], id);
                if(node){
                    return node;
                }
            }
        }
    },
    _getNodeElemByPath: function(path){
        return document.querySelector("#" + this.containerId + " [_id='" + path.join("_") + "']");
    },
    _cloneObj: function(obj){
        return JSON.parse(JSON.stringify(obj));
    }
}