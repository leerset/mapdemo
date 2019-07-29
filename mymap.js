
//创建和初始化地图函数：

function initMap(){
  createMap();//创建地图
  setMapEvent();//设置地图事件
  // map.enableScrollWheelZoom();    	//启用滚轮放大缩小，默认禁用
  // map.disableDragging();           		//禁用地图拖拽，默认启用
  // map.enableKeyboard();         		//启用键盘操作，默认禁用。
  map.disableDoubleClickZoom();      	//禁用双击放大，默认启用
  // BMap.setCustomMapStylePath("custom_map_config.json");
}

function createMap(){
	map = new BMap.Map("l-map",{enableMapClick:false});
	map.centerAndZoom(centerPoint,16);
}

function hideOver(){
	map.clearOverlays();
}

function setMapEvent(){
}

function addClickHandler(target, window){
  target.addEventListener("click",function(){
    target.openInfoWindow(window);
  });
}

// 基本函数

function randomNumber(min, max, accuraty) {
	var number = Math.random() * (max - min) + min;
	return number.toFixed(accuraty);
}

function setContent(len) {
	infoWindows = [];
	for (var i=0; i<len; i++) {
		let sContent = "<div id=\"uuuu\" style=\"width:400px;\" class=\"ax_default\">" +
		"  <div id=\"uuuu\" class=\"col-xs-12\">" +
		"    <div id=\"uuuu_div\" class=\"\"></div>" +
		"    <!-- Unnamed () -->" +
		"    <div id=\"uuuu\" class=\"text\" style=\"visibility: visible;\">" +
		"      <p style=\"font-size:18px;\"><span>" +i+ "号监测点</span><span style=\"font-size:13px;\"></span></p><p style=\"font-size:13px;\"><span>实时数据</span></p><p style=\"font-size:13px;\"><span><br></span></p>" +
		"    </div>" +
		"  </div>" +
		"  <div id=\"uuuu\" class=\"col-xs-5\">" +
		"    <div id=\"uuuu_div\" class=\"\"></div>" +
		"    <div id=\"uuuu\" class=\"text\" style=\"visibility: visible; top: 7px; transform-origin: 59.5px 38px 0px;\">" +
		"      <p><span>水位：" +randomNumber(20, 30, 2)+ " cm</span></p><p><span>流速：" +randomNumber(2, 5, 2)+ " m/s</span></p><p><span>瞬时流速：" +randomNumber(2, 5, 2)+ "m/s</span></p><p><span>pH：" +randomNumber(1, 13, 1)+ "</span></p>" +
		"    </div>" +
		"  </div>" +
		"  <div id=\"uuuu\" class=\"col-xs-7\">" +
		"    <div id=\"uuuu_div\" class=\"\"></div>" +
		"    <div id=\"uuuu\" class=\"text\" style=\"visibility: visible; top: -12px; transform-origin: 59.5px 57px 0px;\">" +
		"      <p><span>COD：" +randomNumber(5, 20, 0)+ " mg/l</span></p><p><span>氨氮：" +randomNumber(0, 2, 3)+ " mg/l</span></p><p><span>六价铬：" +randomNumber(0, 2, 3)+ " mg/l</span></p><p><span>总磷：" +randomNumber(0, 2, 3)+ " mg/l</span></p><p><span>总铜：" +randomNumber(0, 2, 3)+ " mg/l</span></p><p><span>总镍：" +randomNumber(0, 2, 3)+ " mg/l</span></p>" +
		"    </div>" +
		"  </div>" +
		"</div>";
		infoWindows.push(new BMap.InfoWindow(sContent));  // 创建信息窗口对象
	}
}

//////////////////////////////////////////////////////////////////////////////////

// 点阵操作

function getDistance2(point1, point2) {
	return getDistance(point1.lat, point1.lng, point2.lat, point2.lng);
}

function getDistance(lat1, lng1, lat2, lng2) {
  earthRadius = 6367000; //地球半径m

  lat1 = (lat1 * Math.PI ) / 180;
  lng1 = (lng1 * Math.PI ) / 180;

  lat2 = (lat2 * Math.PI ) / 180;
  lng2 = (lng2 * Math.PI ) / 180;

  calcLongitude = lng2 - lng1;
  calcLatitude = lat2 - lat1;
  stepOne = Math.pow(Math.sin(calcLatitude / 2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(calcLongitude / 2), 2);
  stepTwo = 2 * Math.asin(Math.min(1, Math.sqrt(stepOne)));
  calculatedDistance = earthRadius * stepTwo;

  return Math.round(calculatedDistance, 6);
}

function splitPoints(point1, point2, offset = 50) {
	let points = [];
	// points.push(point1);
	let dist = getDistance2(point1, point2);
	let pieces = Math.round(dist / offset);
	if (pieces <= 1) {
		// points.push(point2);
		return points;
	} else {
		let radius = Math.round(dist / pieces);
		let degree = (24901 * 1609) / 360.0;
		let dpmLat = 1 / degree;
		let mpdLng = degree * Math.cos(point1.lat * (Math.PI / 180));
		let dpmLng = 1 / mpdLng;
		let radiusLat = dpmLat * radius;
		let radiusLng = dpmLng * radius;
    let deg = getDegree(point1, point2)
    let a = deg * Math.PI / 180;
		// let minLng = Math.min(point1.lng, point2.lng);
		// let minLat = Math.min(point1.lat, point2.lat);
		let minLng = point1.lng;
		let minLat = point1.lat;
		for ( let i = 1; i < pieces; i++ ) {
			let ln = parseFloat((minLng + i * radiusLng * Math.cos(a)).toFixed(6))
			let la = parseFloat((minLat + i * radiusLat * Math.sin(a)).toFixed(6))
			let newPoint = new BMap.Point(ln, la)
			points.push(newPoint);
		}
		// points.push(point2);
		return points;
	}
}

function getSidePoints(point1, point2, point3, radius = 100) {
	let sidePoints = [];
	let degree = (24901 * 1609) / 360.0;
	let dpmLat = 1 / degree;
	let mpdLng = degree * Math.cos(point1.lat * (Math.PI / 180));
	let dpmLng = 1 / mpdLng;
	let radiusLat = dpmLat * radius;
	let radiusLng = dpmLng * radius;
	let cos = (point2.lng - point3.lng) / radiusLng;
	let sin = (point2.lat - point3.lat) / radiusLat;
  let deg = getDegree(point1, point2)
  let a = deg * Math.PI / 180;
	let b = (deg + 90) * Math.PI / 180;
	let minLng = point1.lng;
	let minLat = point1.lat;
	let ln1 = parseFloat((minLng + 1 * radiusLng * Math.cos(b)).toFixed(6))
	let la1 = parseFloat((minLat + 1 * radiusLat * Math.sin(b)).toFixed(6))
	sidePoints.push(new BMap.Point(ln1, la1));
	let ln2 = parseFloat((minLng - 1 * radiusLng * Math.cos(b)).toFixed(6))
	let la2 = parseFloat((minLat - 1 * radiusLat * Math.sin(b)).toFixed(6))
	sidePoints.push(new BMap.Point(ln2, la2));
	return sidePoints;
}

function getSidePoints2(point1, point2, radius = 100) {
	let sidePoints = [];
	let degree = (24901 * 1609) / 360.0;
	let dpmLat = 1 / degree;
	let mpdLng = degree * Math.cos(point1.lat * (Math.PI / 180));
	let dpmLng = 1 / mpdLng;
	let radiusLat = dpmLat * radius;
	let radiusLng = dpmLng * radius;
  let deg = getDegree(point1, point2)
  let a = deg * Math.PI / 180;
  let b = (deg + 90) * Math.PI / 180;
	let minLng = point1.lng;
	let minLat = point1.lat;
  let ln1 = parseFloat((minLng + 1 * radiusLng * Math.cos(b) - 1 * radiusLng * Math.cos(a)).toFixed(6))
	let la1 = parseFloat((minLat + 1 * radiusLat * Math.sin(b) - 1 * radiusLat * Math.sin(a)).toFixed(6))
	sidePoints.push(new BMap.Point(ln1, la1));
  let ln2 = parseFloat((minLng - 1 * radiusLng * Math.cos(b) - 1 * radiusLng * Math.cos(a)).toFixed(6))
	let la2 = parseFloat((minLat - 1 * radiusLat * Math.sin(b) - 1 * radiusLat * Math.sin(a)).toFixed(6))
	sidePoints.push(new BMap.Point(ln2, la2));
	return sidePoints;
}

function extendPoints(pointArray, offset = 20) {
	let retPoints = [];
	for (let i = 0; i < pointArray.length; i++ ) {
		p = pointArray[i];
		if ( i == 0 ) {
			retPoints.push(p);
		} else {
			retPoints = retPoints.concat(splitPoints(pointArray[i-1], p, offset));
			retPoints.push(p);
		}
	}
	return retPoints;
}

function offsetPoints(pointArray, radius = 100) {
	if (pointArray.length <= 1) { return pointArray}
	let retPoints = [];
	for (let i = 0; i < pointArray.length; i++ ) {
		p = pointArray[i];
		if ( i == 0 ) {
			retPoints.push(getSidePoints2(p,pointArray[1],radius).reverse());
		} else if (i == pointArray.length - 1) {
			retPoints.push(getSidePoints2(p,pointArray[i-1],radius));
		} else {
			retPoints.push(getSidePoints(p,pointArray[i-1],pointArray[i+1],radius));
		}
	}
	return retPoints;
}

function coverPoints(pointArray) {
	if (pointArray.length <= 1) { return pointArray}
	let retPoints = [];
	let offsets = offsetPoints(pointArray);
	for (let i = 0; i < offsets.length; i++ ) {
		retPoints.push(offsets[i][0])
	}
	for (let i = offsets.length - 1; i >= 0; i-- ) {
		retPoints.push(offsets[i][1])
	}
	retPoints.push(offsets[0][0]);
	return retPoints;
}

function addPolyline(pointArray) {
	let polyline = new BMap.Polyline(pointArray, {strokeColor:"#78cdd1", strokeWeight:5, strokeOpacity:0});
	map.addOverlay(polyline);
}

function getDegree(point1, point2) {
	let degree = (24901 * 1609) / 360.0;
	let dpmLat = 1 / degree;
	let mpdLng = degree * Math.cos(point1.lat * (Math.PI / 180));
	let dpmLng = 1 / mpdLng;
	let cos = (point2.lng - point1.lng) / dpmLng;
	let sin = (point2.lat - point1.lat) / dpmLat;
	let a = Math.atan(sin / cos);
	let deg = a * 180 / Math.PI;
	if (sin > 0 && cos > 0) {
		deg = deg;
	} else if (sin > 0 && cos < 0) {
		deg = 180 + deg;
	} else if (sin < 0 && cos < 0) {
		deg = 180 + deg;
	} else if (sin < 0 && cos > 0) {
		deg = 360 + deg;
	}
	return deg;
}

function getArcPoints(point, radius, dropPoint, width = 100) {
	let lng = point.lng;
	let lat = point.lat;
	let arcPoints = [];
	let degree = (24901 * 1609) / 360.0;
  let dpmLat = 1 / degree;
	let mpdLng = degree * Math.cos(lat * (Math.PI / 180));
	let dpmLng = 1 / mpdLng;

	let radiusLat = dpmLat * radius;
	let minLat = lat - radiusLat;
	let maxLat = lat + radiusLat;

	let radiusLng = dpmLng * radius;
	let minLng = lng - radiusLng;
	let maxLng = lng + radiusLng;
	let deg = getDegree(point, dropPoint);
	let widthDegree = Math.asin(width / 2 / radius) * 180 / Math.PI;
	let offset = 2;
	for (let a = deg - widthDegree; a <= deg + widthDegree; a += offset) {
		let cos = Math.cos(a / 180 * Math.PI);
		let sin = Math.sin(a / 180 * Math.PI);
		let ln = parseFloat((lng + radiusLng * cos).toFixed(6))
		let la = parseFloat((lat + radiusLat * sin).toFixed(6))
		if ( arcPoints.length > 0 &&
			   la == arcPoints[arcPoints.length - 1].lat) {
			la += 0.000001;
		}
		if ( arcPoints.length > 0 &&
			   ln == arcPoints[arcPoints.length - 1].lng) {
			ln += 0.000001;
		}
		arcPoints.push(new BMap.Point(ln, la))
	}
	// for (var a = 121; a <= 240; a += 60) {
	// 	arcPoints.push(new BMap.Point(lng + radiusLng * Math.cos(a / 180 * Math.PI), lat + radiusLat * Math.sin(a / 180 * Math.PI)))
	// }
	return arcPoints;
}

function cutPoints(sidePoints, pipePoints, count = 3) {
	let pipePoint = pipePoints[pipePoints.length-2];
	let cutPoints = [];
	let minIndex = 0;
	let minPoint = sidePoints[0];
	let minDistance = getDistance2(minPoint, pipePoint);
	let len = sidePoints.length;
	for (let i = 1; i < len; i++) {
		let newPoint = sidePoints[i];
		let newDistance = getDistance2(newPoint, pipePoint);
		if (newDistance < minDistance) {
			minPoint = newPoint;
			minDistance = newDistance;
			minIndex = i;
		}
	}
	let half = Math.round(count / 2);
	for (let j = -half; j <= half; j++) {
		cutPoints.push(sidePoints[(minIndex + j) % len]);
	}
	return cutPoints;
}

function getCirclePoints(point, radius) {
	let lng = point.lng;
	let lat = point.lat;
	let circlePoints = [];
	let degree = (24901 * 1609) / 360.0;
  	let dpmLat = 1 / degree;
	let mpdLng = degree * Math.cos(lat * (Math.PI / 180));
	let dpmLng = 1 / mpdLng;

	let radiusLat = dpmLat * radius;
	let minLat = lat - radiusLat;
	let maxLat = lat + radiusLat;

	let radiusLng = dpmLng * radius;
	let minLng = lng - radiusLng;
	let maxLng = lng + radiusLng;
	for (let a = 270; a <= 270 + 360; a += 10) {
		let cos = Math.cos(a / 180 * Math.PI);
		let sin = Math.sin(a / 180 * Math.PI);
		let ln = parseFloat((lng + radiusLng * cos).toFixed(6))
		let la = parseFloat((lat + radiusLat * sin).toFixed(6))
		if ( circlePoints.length > 0 &&
			   la == circlePoints[circlePoints.length - 1].lat) {
			la += 0.000001;
		}
		if ( circlePoints.length > 0 &&
			   ln == circlePoints[circlePoints.length - 1].lng) {
			ln += 0.000001;
		}
		circlePoints.push(new BMap.Point(ln, la))
	}
	// for (var a = 121; a <= 240; a += 60) {
	// 	circlePoints.push(new BMap.Point(lng + radiusLng * Math.cos(a / 180 * Math.PI), lat + radiusLat * Math.sin(a / 180 * Math.PI)))
	// }
	return circlePoints;
}

// 按钮停用函数

function addDrops(){
	// 随机向地图添加标注
	setContent(100);
	for (var i = 0; i < 3; i ++) {
		for (var j = 0; j < 3; j ++) {
			var point = areaCenterPoints[j];
			var rad = rads[j] / 56572.0;
			var pointR = new BMap.Point(point.lng + rad * (Math.random() * 0.8) - rad * (Math.random() * 0.8), point.lat + rad * (Math.random() * 0.8) - rad * (Math.random() * 0.8));
			var idx = parseInt(Math.random() * 4);
			let markerR = new BMap.Marker(pointR,{icon:dropIcons[idx]});
			let infoWindow = infoWindows[i*7+j];
			map.addOverlay(markerR);
			markerR.addEventListener("click", function(){
				// var marker = new BMap.Marker(point);
				// map.addOverlay(marker);
			   this.openInfoWindow(infoWindow);
				 // infoWindow.redraw();
			   //图片加载完毕重绘infowindow
			   // document.getElementById('imgDemo').onload = function (){
				 //   infoWindow.redraw();   //防止在网速较慢，图片未加载时，生成的信息框高度比图片的总高度小，导致图片部分被隐藏
			   // }
			});

		}
	}
	areaCenterPoints.forEach(function (point) {
		// var markerR = new BMap.Marker(point);
		// map.addOverlay(markerR);
	})
}

function addPipes(){
	// 随机向地图添加标注
	pipePoints.forEach(function (points) {
		var idx = parseInt(Math.random() * 4);
		var markerR = new BMap.Marker(points[0],{icon:pipeIcons[idx]});
		map.addOverlay(markerR);
	})
}

function addBoxes(){
	// 随机向地图添加标注
	boxPoints.forEach(function (point) {
		var idx = parseInt(Math.random() * 4);
		boxHash[[point.lng, point.lat]] = idx + 1;
		var markerR = new BMap.Marker(point,{icon:boxIcons[idx]});
		map.addOverlay(markerR);
	})
}

function addLines(){
	// map.addOverlay(polyline);
	map.addOverlay(pl1);
	map.addOverlay(pl2);
	map.addOverlay(pl3);
}

function initEreas() {
	ereas = [];
	for(i=0;i<areaCenterPoints.length;i++){
		var c = new BMap.Circle(areaCenterPoints[i], rads[i], {strokeColor:"blue", strokeWeight:0, strokeOpacity:0,fillOpacity: 0.8, fillColor: "#FFFFFF"});
		var circlePoints = getCirclePoints(areaCenterPoints[i].lng, areaCenterPoints[i].lat, rads[i]);
		var ps = []
		ps.push(new BMap.Point(ne.lng,ne.lat))
		ps.push(new BMap.Point(sw.lng,ne.lat))
		ps.push(new BMap.Point(sw.lng,sw.lat))
		ps.push(new BMap.Point(ne.lng,sw.lat))
		ps.push(new BMap.Point(ne.lng,ne.lat))
		ps = ps.concat(circlePoints)
		ps.push(new BMap.Point(ne.lng,ne.lat))
		ps = ps.concat(riverCoverPoints)
		ps.push(new BMap.Point(ne.lng,ne.lat))
		ps = ps.concat(pipeAreaPoints[i])
		ps.push(new BMap.Point(ne.lng,ne.lat))

		// var curve = new BMapLib.CurveLine(ps.reverse(), {strokeColor:"blue", strokeWeight:1, strokeOpacity:0.5}); //创建弧线对象
		var curve = new BMap.Polygon(ps, {strokeColor:"none", strokeWeight:1, strokeOpacity:0.5, fillColor: "rgb(0,0,0)", fillOpacity:0.3}); //创建弧线对象
		ereas.push(curve);
	}
}

function addEreas(i){
	// ereas.forEach(function (e) {map.addOverlay(e);})
	map.addOverlay(ereas[i]);
	// map.panTo(areaCenterPoints[3]);
}

function removeEreas(i){
	// ereas.forEach(function (e) {map.addOverlay(e);})
	map.removeOverlay(ereas[i]);
	// map.panTo(areaCenterPoints[3]);
}

function addFlow() {
	plOpts = [];
	var idx = 0;
	var color = "green";
  let linePoints = river.extendPoints;
	for (var a = 0; a < linePoints.length; a ++) {
		var point = linePoints[a];
		if (boxHash[[point.lng,point.lat]]) { idx = boxHash[[point.lng,point.lat]]; }
		if (idx == 0) { color = "green"}
		if (idx == 1) { color = "green"}
		if (idx == 2) { color = "grey"}
		if (idx == 3) { color = "orange"}
		if (idx == 4) { color = "red"}
		plOpts.push({strokeColor:color, strokeWeight:5 + a / map.Va, strokeOpacity:"0.4"});
		// plOpts.push({strokeColor:color, strokeWeight:7, strokeOpacity:"0.4"});
	}
	addPolylines();
	flow = true;
	adynamicLines();
}

function removeFlow(){
	flow = false;
	for (var i = 0; i < polylines.length; i++) {
			map.removeOverlay(polylines[i]);
	}
}

function addOver() {
	let ps = []
	ps.push(new BMap.Point(ne.lng,ne.lat))
	ps.push(new BMap.Point(sw.lng,ne.lat))
	ps.push(new BMap.Point(sw.lng,sw.lat))
	ps.push(new BMap.Point(ne.lng,sw.lat))
	ps.push(new BMap.Point(ne.lng,ne.lat))
	ps = ps.concat(river.coverPoints)
	ps.push(new BMap.Point(ne.lng,ne.lat))
  ps = ps.concat(group.circlePoints)
  ps.push(new BMap.Point(ne.lng,ne.lat))
  ps = ps.concat(group.arcPoints)
  ps = ps.concat(group.cutPoints)
  ps = ps.concat(group.arcPoints[0])
  ps.push(new BMap.Point(ne.lng,ne.lat))

	// var curve = new BMapLib.CurveLine(ps.reverse(), {strokeColor:"blue", strokeWeight:1, strokeOpacity:0.5}); //创建弧线对象
	var curve = new BMap.Polygon(ps, {strokeColor:"none", strokeWeight:1, strokeOpacity:0.5, fillColor: "rgb(0,0,0)", fillOpacity:0.5}); //创建弧线对象
	map.addOverlay(curve);
}

function addPolylines(){
  let linePoints = river.extendPoints;
	for(var i = 0; i < linePoints.length - 2; i++){
		var polyline = new BMap.Polyline([linePoints[i],linePoints[i+1]],plOpts[i]);
		map.addOverlay(polyline);   //增加折线
		// polyline.hide();
		polylines.push(polyline);
	}
}

function addMarker(points) {
    //循环建立标注点
    for(var i=0, pointsLen = points.length; i<pointsLen; i++) {
        var point = new BMap.Point(points[i].lng, points[i].lat); //将标注点转化成地图上的点
        var marker = new BMap.Marker(point); //将点转化成标注点
        map.addOverlay(marker);  //将标注点添加到地图上
        //添加监听事件
        (function() {
            var thePoint = points[i];
            marker.addEventListener("click",
                function() {
                showInfo(this,thePoint);
            });
         })();
    }
}

// 流水动作

//随机生成新的点，加入到轨迹中。
function adynamicLines(){
	if (!flow) return;
	// for (var i = 0; i < polylines.length; i++) {
	// 	polylines[i].hide();
	// }
	for (var i = 0; i < polylines.length; i++) {
		if ( i % 3 == offset) {
			polylines[i].show();
		} else {
			polylines[i].hide();
		}
	}
	offset += 1;
	if (offset == 3) {offset = 0;}
  	setTimeout(adynamicLines, 300);
}


function initRiver(){
  river.extendPoints = extendPoints(river.originPoints);
  river.coverPoints = coverPoints(river.extendPoints);
}

function addGroups(river) {
    areaCenterPoints.forEach(function (midPoint){

    })
    let group = {
        name: "XXX",
        id: 1,
        river_id: 1,
        midPoint: new BMap.Point(1,2),
        radius: 400,
        drops: [],
        pipe: null,

    }
    river.groups.push(group);
}

////////////////////////////////////////////////////////////////////////////////////////////////////

var map;
var centerPoint = new BMap.Point(114.0515977283,22.5199590014);
var ne = new BMap.Point(113.834155, 22.413675);
var sw = new BMap.Point(114.274827, 22.616664);

// Icon

var dropIcons = [];
dropIcons.push(new BMap.Icon("images/drop_green.png", new BMap.Size(40,40)
	,{
		offset: new BMap.Size(0, 0), // 指定定位位置
		imageOffset: new BMap.Size(10, 0) // 设置图片偏移
	}
));
dropIcons.push(new BMap.Icon("images/drop_red.png", new BMap.Size(40,40)	,{
		offset: new BMap.Size(0, 0), // 指定定位位置
		imageOffset: new BMap.Size(10, 0) // 设置图片偏移
	}
));
dropIcons.push(new BMap.Icon("images/drop_orange.png", new BMap.Size(40,40)	,{
		offset: new BMap.Size(0, 0), // 指定定位位置
		imageOffset: new BMap.Size(10, 0) // 设置图片偏移
	}
));
dropIcons.push(new BMap.Icon("images/drop_grey.png", new BMap.Size(40,40)	,{
		offset: new BMap.Size(0, 0), // 指定定位位置
		imageOffset: new BMap.Size(10, 0) // 设置图片偏移
	}
));

// 管道图标
var pipeIcons = [];
pipeIcons.push(new BMap.Icon("images/pipe_green.png", new BMap.Size(20,20)));
pipeIcons.push(new BMap.Icon("images/pipe_grey.png", new BMap.Size(20,20)));
pipeIcons.push(new BMap.Icon("images/pipe_orange.png", new BMap.Size(20,20)));
pipeIcons.push(new BMap.Icon("images/pipe_red.png", new BMap.Size(20,20)));

// 河面图标
var boxIcons = [];
boxIcons.push(new BMap.Icon("images/box_green.png", new BMap.Size(20,20)));
boxIcons.push(new BMap.Icon("images/box_grey.png", new BMap.Size(20,20)));
boxIcons.push(new BMap.Icon("images/box_orange.png", new BMap.Size(20,20)));
boxIcons.push(new BMap.Icon("images/box_red.png", new BMap.Size(20,20)));

// 区域圆心
var areaO1 = new BMap.Point(114.0469272065,22.5191553878);
var areaO2 = new BMap.Point(114.0478677201,22.5232816411);
var areaO3 = new BMap.Point(114.0498632836,22.5280784373);
var areaO4 = new BMap.Point(114.0531855960,22.5154790956);
var areaO5 = new BMap.Point(114.0566152307,22.5219838553);
var areaO6 = new BMap.Point(114.0584820482,22.5259085518);
var areaO7 = new BMap.Point(114.0564006540,22.5286240594);

var ereas = [];
var areaCenterPoints = [areaO1,areaO2,areaO3,areaO4,areaO5,areaO6,areaO7];
var rads = [125,215,285,175,215,245,135];

var riverOriginPoints = [
	new BMap.Point(114.054989,22.525769),
	new BMap.Point(114.054774,22.525298),
	new BMap.Point(114.054145,22.524488),
	new BMap.Point(114.054095,22.524221),
	new BMap.Point(114.051733,22.520586),
	new BMap.Point(114.051535,22.520127),
	new BMap.Point(114.051329,22.519284),
	new BMap.Point(114.048795,22.515128),
	new BMap.Point(114.045391,22.510145)
];

var river = {
    name: "XXX",
    id: 1,
    groups: [],
    boxes: [],
    originPoints: riverOriginPoints,
    extendPoints: extendPoints(riverOriginPoints, 20),
    coverPoints: coverPoints(extendPoints(riverOriginPoints)),
    boxPoints: [],
};

var boxPoints = [
  river.extendPoints[20],
  river.extendPoints[40],
  river.extendPoints[60],
  river.extendPoints[80],
]

var boxHash = {}
boxPoints.forEach(function(bp) {
  boxHash[[bp.lng, bp.lat]] = 0;
})

var pipeDropPoint = new BMap.Point(114.04769, 22.519159)
var pipePoint = river.extendPoints[60];

var group = {
    name: "XXX",
    id: 1,
    river_id: 1,
    centerPoint: areaCenterPoints[0],
    circlePoints: getCirclePoints(areaCenterPoints[0], rads[0]),
    arcPoints: getArcPoints(areaCenterPoints[0], rads[0], pipePoint),
    cutPoints: cutPoints(river.coverPoints, extendPoints([pipeDropPoint,pipePoint]),5),
    radius: rads[0],
    drops: [],
    pipe: {
        pipePoints: extendPoints([pipeDropPoint,pipePoint])
    },
    cover: null,
}

var polylines = [];
var plOpts = [];

var infoWindows = [];

var flow = false;
var offset = 0;

window.onload=function(){
  addBoxes();
  addFlow();
}
