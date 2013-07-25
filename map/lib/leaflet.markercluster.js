/*
 Leaflet.markercluster, Provides Beautiful Animated Marker Clustering functionality for Leaflet, a JS library for interactive maps.
 https://github.com/Leaflet/Leaflet.markercluster
 (c) 2012-2013, Dave Leaver, smartrak
*/
!function(t,e,i){L.MarkerClusterGroup=L.FeatureGroup.extend({options:{maxClusterRadius:80,iconCreateFunction:null,spiderfyOnMaxZoom:!0,showCoverageOnHover:!0,zoomToBoundsOnClick:!0,singleMarkerMode:!1,disableClusteringAtZoom:null,removeOutsideVisibleBounds:!0,animateAddingMarkers:!1,spiderfyDistanceMultiplier:1,polygonOptions:{}},initialize:function(t){L.Util.setOptions(this,t),this.options.iconCreateFunction||(this.options.iconCreateFunction=this._defaultIconCreateFunction),this._featureGroup=L.featureGroup(),this._featureGroup.on(L.FeatureGroup.EVENTS,this._propagateEvent,this),this._nonPointGroup=L.featureGroup(),this._nonPointGroup.on(L.FeatureGroup.EVENTS,this._propagateEvent,this),this._inZoomAnimation=0,this._needsClustering={},this._needsRemoving={},this._currentShownBounds=null,this._deferredLayersToAdd=[]},addLayer:function(t){if(t instanceof L.LayerGroup){var e=[];for(var i in t._layers)e.push(t._layers[i]);return this.addLayers(e)}if(!t.getLatLng)return this._nonPointGroup.addLayer(t),this;if(!this._map)return t._markerClusterId||(t._markerClusterId=this._generateLayerId()),this._needsClustering[t._markerClusterId]=t,this;if(this.hasLayer(t))return this;this._unspiderfy&&this._unspiderfy(),this._addLayer(t,this._maxZoom);var n=t,r=this._map.getZoom();if(t.__parent)for(;n.__parent._zoom>=r;)n=n.__parent;return this._currentShownBounds.contains(n.getLatLng())&&(this.options.animateAddingMarkers?this._animationAddLayer(t,n):this._animationAddLayerNonAnimated(t,n)),this},removeLayer:function(t){return t.getLatLng?this._map?t.__parent?(this._unspiderfy&&(this._unspiderfy(),this._unspiderfyLayer(t)),this._removeLayer(t,!0),this._featureGroup.hasLayer(t)&&(this._featureGroup.removeLayer(t),t.setOpacity&&t.setOpacity(1)),this):this:(t._markerClusterId in this._needsClustering?delete this._needsClustering[t._markerClusterId]:this.hasLayer(t)&&(this._needsRemoving[t._markerClusterId]=t),this):(this._nonPointGroup.removeLayer(t),this)},addLayers:function(t){var e,i,n,r=this._map,s=this._featureGroup,o=this._nonPointGroup;for(e=0,i=t.length;i>e;e++)if(n=t[e],n.getLatLng){if(!this.hasLayer(n))if(r){if(this._addLayer(n,this._maxZoom),n.__parent&&2===n.__parent.getChildCount()){var a=n.__parent.getAllChildMarkers(),_=a[0]===n?a[1]:a[0];s.removeLayer(_)}}else n._markerClusterId||(n._markerClusterId=this._generateLayerId()),this._needsClustering[n._markerClusterId]=n}else o.addLayer(n);return r&&(s.eachLayer(function(t){t instanceof L.MarkerCluster&&t._iconNeedsUpdate&&t._updateIcon()}),this._topClusterLevel._recursivelyAddChildrenToMap(null,this._zoom,this._currentShownBounds)),this},removeLayers:function(t){var e,i,n,r=this._featureGroup,s=this._nonPointGroup;if(!this._map){for(e=0,i=t.length;i>e;e++)n=t[e],delete this._needsClustering[n._markerClusterId],s.removeLayer(n);return this}for(e=0,i=t.length;i>e;e++)n=t[e],n.__parent?(this._removeLayer(n,!0,!0),r.hasLayer(n)&&(r.removeLayer(n),n.setOpacity&&n.setOpacity(1))):s.removeLayer(n);return this._topClusterLevel._recursivelyAddChildrenToMap(null,this._zoom,this._currentShownBounds),r.eachLayer(function(t){t instanceof L.MarkerCluster&&t._updateIcon()}),this},clearLayers:function(){return this._map||(this._needsClustering={},delete this._gridClusters,delete this._gridUnclustered),this._noanimationUnspiderfy&&this._noanimationUnspiderfy(),this._featureGroup.clearLayers(),this._nonPointGroup.clearLayers(),this.eachLayer(function(t){delete t.__parent}),this._map&&this._generateInitialClusters(),this},getBounds:function(){var t=new L.LatLngBounds;if(this._topClusterLevel)t.extend(this._topClusterLevel._bounds);else for(var e in this._needsClustering)this._needsClustering.hasOwnProperty(e)&&t.extend(this._needsClustering[e].getLatLng());var i=this._nonPointGroup.getBounds();return i.isValid()&&t.extend(i),t},eachLayer:function(t,e){var i,n=[];for(var r in this._needsClustering)this._needsClustering.hasOwnProperty(r)&&n.push(this._needsClustering[r]);for(this._topClusterLevel&&this._topClusterLevel.getAllChildMarkers(n),i=n.length-1;i>=0;i--)t.call(e,n[i]);this._nonPointGroup.eachLayer(t,e)},hasLayer:function(t){return t?t._markerClusterId in this._needsClustering?!0:t._markerClusterId in this._needsRemoving?!1:!(!t.__parent||t.__parent._group!==this)||this._nonPointGroup.hasLayer(t):!1},zoomToShowLayer:function(t,e){var i=function(){if((t._icon||t.__parent._icon)&&!this._inZoomAnimation)if(this._map.off("moveend",i,this),this.off("animationend",i,this),t._icon)e();else if(t.__parent._icon){var n=function(){this.off("spiderfied",n,this),e()};this.on("spiderfied",n,this),t.__parent.spiderfy()}};t._icon?e():t.__parent._zoom<this._map.getZoom()?(this._map.on("moveend",i,this),t._icon||this._map.panTo(t.getLatLng())):(this._map.on("moveend",i,this),this.on("animationend",i,this),this._map.setView(t.getLatLng(),t.__parent._zoom+1),t.__parent.zoomToBounds())},onAdd:function(t){this._map=t;var e,i,n=this;if(!isFinite(this._map.getMaxZoom()))throw"Map has no maxZoom specified";this._featureGroup.onAdd(t),this._nonPointGroup.onAdd(t),this._gridClusters||this._generateInitialClusters();for(e in this._needsRemoving)this._needsRemoving.hasOwnProperty(e)&&(i=this._needsRemoving[e],this._removeLayer(i));this._needsRemoving={};for(e in this._needsClustering)if(this._needsClustering.hasOwnProperty(e)){if(i=this._needsClustering[e],!i.getLatLng){this._featureGroup.addLayer(i);continue}if(i.__parent)continue;this._addLayer(i,this._maxZoom,!0)}this._addAllDeferredLayers(function(){n._needsClustering={},n._map.on("zoomend",n._zoomEnd,n),n._map.on("moveend",n._moveEnd,n),n._spiderfierOnAdd&&n._spiderfierOnAdd(),n._bindEvents(),n._zoom=n._map.getZoom(),n._currentShownBounds=n._getExpandedVisibleBounds(),n._topClusterLevel._recursivelyAddChildrenToMap(null,n._zoom,n._currentShownBounds)},this.options.deferredStep||10)},onRemove:function(t){t.off("zoomend",this._zoomEnd,this),t.off("moveend",this._moveEnd,this),this._unbindEvents(),this._map._mapPane.className=this._map._mapPane.className.replace(" leaflet-cluster-anim",""),this._spiderfierOnRemove&&this._spiderfierOnRemove(),this._featureGroup.onRemove(t),this._nonPointGroup.onRemove(t),this._map=null},getVisibleParent:function(t){for(var e=t;null!==e&&!e._icon;)e=e.__parent;return e},_arraySplice:function(t,e){for(var i=t.length-1;i>=0;i--)if(t[i]===e)return t.splice(i,1),!0},_removeLayer:function(t,e,i){var n=this._gridClusters,r=this._gridUnclustered,s=this._featureGroup,o=this._map;if(e)for(var a=this._maxZoom;a>=0&&r[a].removeObject(t,o.project(t.getLatLng(),a));a--);var _,h=t.__parent,u=h._markers;for(this._arraySplice(u,t);h&&(h._childCount--,!(h._zoom<0));)e&&h._childCount<=1?(_=h._markers[0]===t?h._markers[1]:h._markers[0],n[h._zoom].removeObject(h,o.project(h._cLatLng,h._zoom)),r[h._zoom].addObject(_,o.project(_.getLatLng(),h._zoom)),this._arraySplice(h.__parent._childClusters,h),h.__parent._markers.push(_),_.__parent=h.__parent,h._icon&&(s.removeLayer(h),i||s.addLayer(_))):(h._recalculateBounds(),i&&h._icon||h._updateIcon()),h=h.__parent;delete t.__parent},_propagateEvent:function(t){t.layer instanceof L.MarkerCluster&&(t.type="cluster"+t.type),this.fire(t.type,t)},_defaultIconCreateFunction:function(t){var e=t.getChildCount(),i=" marker-cluster-";return i+=10>e?"small":100>e?"medium":"large",new L.DivIcon({html:"<div><span>"+e+"</span></div>",className:"marker-cluster"+i,iconSize:new L.Point(40,40)})},_bindEvents:function(){var t=this._map,e=this.options.spiderfyOnMaxZoom,i=this.options.showCoverageOnHover,n=this.options.zoomToBoundsOnClick;(e||n)&&this.on("clusterclick",this._zoomOrSpiderfy,this),i&&(this.on("clustermouseover",this._showCoverage,this),this.on("clustermouseout",this._hideCoverage,this),t.on("zoomend",this._hideCoverage,this),t.on("layerremove",this._hideCoverageOnRemove,this))},_zoomOrSpiderfy:function(t){var e=this._map;e.getMaxZoom()===e.getZoom()?this.options.spiderfyOnMaxZoom&&t.layer.spiderfy():this.options.zoomToBoundsOnClick&&t.layer.zoomToBounds()},_showCoverage:function(t){var e=this._map;this._inZoomAnimation||(this._shownPolygon&&e.removeLayer(this._shownPolygon),t.layer.getChildCount()>2&&t.layer!==this._spiderfied&&(this._shownPolygon=new L.Polygon(t.layer.getConvexHull(),this.options.polygonOptions),e.addLayer(this._shownPolygon)))},_hideCoverage:function(){this._shownPolygon&&(this._map.removeLayer(this._shownPolygon),this._shownPolygon=null)},_hideCoverageOnRemove:function(t){t.layer===this&&this._hideCoverage()},_unbindEvents:function(){var t=this.options.spiderfyOnMaxZoom,e=this.options.showCoverageOnHover,i=this.options.zoomToBoundsOnClick,n=this._map;(t||i)&&this.off("clusterclick",this._zoomOrSpiderfy,this),e&&(this.off("clustermouseover",this._showCoverage,this),this.off("clustermouseout",this._hideCoverage,this),n.off("zoomend",this._hideCoverage,this),n.off("layerremove",this._hideCoverageOnRemove,this))},_zoomEnd:function(){this._map&&(this._mergeSplitClusters(),this._zoom=this._map._zoom,this._currentShownBounds=this._getExpandedVisibleBounds())},_moveEnd:function(){if(!this._inZoomAnimation){var t=this._getExpandedVisibleBounds();this._topClusterLevel._recursivelyRemoveChildrenFromMap(this._currentShownBounds,this._zoom,t),this._topClusterLevel._recursivelyAddChildrenToMap(null,this._zoom,t),this._currentShownBounds=t}},_generateInitialClusters:function(){var t=this._map.getMaxZoom(),e=this.options.maxClusterRadius;this.options.disableClusteringAtZoom&&(t=this.options.disableClusteringAtZoom-1),this._maxZoom=t,this._gridClusters={},this._gridUnclustered={};for(var i=t;i>=0;i--)this._gridClusters[i]=new L.DistanceGrid(e),this._gridUnclustered[i]=new L.DistanceGrid(e);this._topClusterLevel=new L.MarkerCluster(this,-1)},_addAllDeferredLayers:function(t,e){this._addDeferredLayers(0,e,this._deferredLayersToAdd.length,t)},_addDeferredLayers:function(t,e,i,n){for(var r=this,s=e+t>i?i:e+t,o=t;s>o;o++)this._addLayer.apply(this,this._deferredLayersToAdd[o]);this.fire("addinglayers",{added:s,total:i}),s===i?(this._deferredLayersToAdd=[],n(),this.fire("addedlayers")):setTimeout(function(){r._addDeferredLayers(t+e,e,i,n)},1)},_addLayer:function(t,e,i){if(i===!0)return this._deferredLayersToAdd.push([t,e]),void 0;var n,r,s=this._gridClusters,o=this._gridUnclustered;for(this.options.singleMarkerMode&&(t.options.icon=this.options.iconCreateFunction({getChildCount:function(){return 1},getAllChildMarkers:function(){return[t]}}));e>=0;e--){n=this._map.project(t.getLatLng(),e);var a=s[e].getNearObject(n);if(a)return a._addChild(t),t.__parent=a,void 0;if(a=o[e].getNearObject(n)){var _=a.__parent;_&&this._removeLayer(a,!1);var h=new L.MarkerCluster(this,e,a,t);s[e].addObject(h,this._map.project(h._cLatLng,e)),a.__parent=h,t.__parent=h;var u=h;for(r=e-1;r>_._zoom;r--)u=new L.MarkerCluster(this,r,u),s[r].addObject(u,this._map.project(a.getLatLng(),r));for(_._addChild(u),r=e;r>=0&&o[r].removeObject(a,this._map.project(a.getLatLng(),r));r--);return}o[e].addObject(t,n)}this._topClusterLevel._addChild(t),t.__parent=this._topClusterLevel},_mergeSplitClusters:function(){this._zoom<this._map._zoom?(this._animationStart(),this._topClusterLevel._recursivelyRemoveChildrenFromMap(this._currentShownBounds,this._zoom,this._getExpandedVisibleBounds()),this._animationZoomIn(this._zoom,this._map._zoom)):this._zoom>this._map._zoom?(this._animationStart(),this._animationZoomOut(this._zoom,this._map._zoom)):this._moveEnd()},_getExpandedVisibleBounds:function(){if(!this.options.removeOutsideVisibleBounds)return this.getBounds();var t=this._map,e=t.getBounds(),i=e._southWest,n=e._northEast,r=L.Browser.mobile?0:Math.abs(i.lat-n.lat),s=L.Browser.mobile?0:Math.abs(i.lng-n.lng);return new L.LatLngBounds(new L.LatLng(i.lat-r,i.lng-s,!0),new L.LatLng(n.lat+r,n.lng+s,!0))},_animationAddLayerNonAnimated:function(t,e){if(e===t)this._featureGroup.addLayer(t);else if(2===e._childCount){e._addToMap();var i=e.getAllChildMarkers();this._featureGroup.removeLayer(i[0]),this._featureGroup.removeLayer(i[1])}else e._updateIcon()}}),L.MarkerClusterGroup.include(L.DomUtil.TRANSITION?{_animationStart:function(){this._map._mapPane.className+=" leaflet-cluster-anim",this._inZoomAnimation++},_animationEnd:function(){this._map&&(this._map._mapPane.className=this._map._mapPane.className.replace(" leaflet-cluster-anim","")),this._inZoomAnimation--,this.fire("animationend")},_animationZoomIn:function(t,e){var i,n=this,r=this._getExpandedVisibleBounds(),s=this._featureGroup;this._topClusterLevel._recursively(r,t,0,function(n){var o,a=n._latlng,_=n._markers;for(n._isSingleParent()&&t+1===e?(s.removeLayer(n),n._recursivelyAddChildrenToMap(null,e,r)):(n.setOpacity(0),n._recursivelyAddChildrenToMap(a,e,r)),i=_.length-1;i>=0;i--)o=_[i],r.contains(o._latlng)||s.removeLayer(o)}),this._forceLayout(),n._topClusterLevel._recursivelyBecomeVisible(r,e),s.eachLayer(function(t){t instanceof L.MarkerCluster||!t._icon||t.setOpacity(1)}),n._topClusterLevel._recursively(r,t,e,function(t){t._recursivelyRestoreChildPositions(e)}),setTimeout(function(){n._topClusterLevel._recursively(r,t,0,function(t){s.removeLayer(t),t.setOpacity(1)}),n._animationEnd()},200)},_animationZoomOut:function(t,e){this._animationZoomOutSingle(this._topClusterLevel,t-1,e),this._topClusterLevel._recursivelyAddChildrenToMap(null,e,this._getExpandedVisibleBounds()),this._topClusterLevel._recursivelyRemoveChildrenFromMap(this._currentShownBounds,t,this._getExpandedVisibleBounds())},_animationZoomOutSingle:function(t,e,i){var n=this._getExpandedVisibleBounds();t._recursivelyAnimateChildrenInAndAddSelfToMap(n,e+1,i);var r=this;this._forceLayout(),t._recursivelyBecomeVisible(n,i),setTimeout(function(){if(1===t._childCount){var s=t._markers[0];s.setLatLng(s.getLatLng()),s.setOpacity(1)}else t._recursively(n,i,0,function(t){t._recursivelyRemoveChildrenFromMap(n,e+1)});r._animationEnd()},200)},_animationAddLayer:function(t,e){var i=this,n=this._featureGroup;n.addLayer(t),e!==t&&(e._childCount>2?(e._updateIcon(),this._forceLayout(),this._animationStart(),t._setPos(this._map.latLngToLayerPoint(e.getLatLng())),t.setOpacity(0),setTimeout(function(){n.removeLayer(t),t.setOpacity(1),i._animationEnd()},200)):(this._forceLayout(),i._animationStart(),i._animationZoomOutSingle(e,this._map.getMaxZoom(),this._map.getZoom())))},_forceLayout:function(){L.Util.falseFn(e.body.offsetWidth)},_generateLayerId:function(){return L.markerClusterGroup.lastLayerId===i?L.markerClusterGroup.lastLayerId=1:L.markerClusterGroup.lastLayerId+=1,L.markerClusterGroup.lastLayerId}}:{_animationStart:function(){},_animationZoomIn:function(t,e){this._topClusterLevel._recursivelyRemoveChildrenFromMap(this._currentShownBounds,t),this._topClusterLevel._recursivelyAddChildrenToMap(null,e,this._getExpandedVisibleBounds())},_animationZoomOut:function(t,e){this._topClusterLevel._recursivelyRemoveChildrenFromMap(this._currentShownBounds,t),this._topClusterLevel._recursivelyAddChildrenToMap(null,e,this._getExpandedVisibleBounds())},_animationAddLayer:function(t,e){this._animationAddLayerNonAnimated(t,e)}}),L.markerClusterGroup=function(t){return new L.MarkerClusterGroup(t)},L.MarkerCluster=L.Marker.extend({initialize:function(t,e,i,n){L.Marker.prototype.initialize.call(this,i?i._cLatLng||i.getLatLng():new L.LatLng(0,0),{icon:this}),this._group=t,this._zoom=e,this._markers=[],this._childClusters=[],this._childCount=0,this._iconNeedsUpdate=!0,this._bounds=new L.LatLngBounds,i&&this._addChild(i),n&&this._addChild(n)},getAllChildMarkers:function(t){t=t||[];for(var e=this._childClusters.length-1;e>=0;e--)this._childClusters[e].getAllChildMarkers(t);for(var i=this._markers.length-1;i>=0;i--)t.push(this._markers[i]);return t},getChildCount:function(){return this._childCount},zoomToBounds:function(){this._group._map.fitBounds(this._bounds)},getBounds:function(){var t=new L.LatLngBounds;return t.extend(this._bounds),t},_updateIcon:function(){this._iconNeedsUpdate=!0,this._icon&&this.setIcon(this)},createIcon:function(){return this._iconNeedsUpdate&&(this._iconObj=this._group.options.iconCreateFunction(this),this._iconNeedsUpdate=!1),this._iconObj.createIcon()},createShadow:function(){return this._iconObj.createShadow()},_addChild:function(t,e){this._iconNeedsUpdate=!0,this._expandBounds(t),t instanceof L.MarkerCluster?(e||(this._childClusters.push(t),t.__parent=this),this._childCount+=t._childCount):(e||this._markers.push(t),this._childCount++),this.__parent&&this.__parent._addChild(t,!0)},_expandBounds:function(t){var e,i=t._wLatLng||t._latlng;t instanceof L.MarkerCluster?(this._bounds.extend(t._bounds),e=t._childCount):(this._bounds.extend(i),e=1),this._cLatLng||(this._cLatLng=t._cLatLng||i);var n=this._childCount+e;this._wLatLng?(this._wLatLng.lat=(i.lat*e+this._wLatLng.lat*this._childCount)/n,this._wLatLng.lng=(i.lng*e+this._wLatLng.lng*this._childCount)/n):this._latlng=this._wLatLng=new L.LatLng(i.lat,i.lng)},_addToMap:function(t){t&&(this._backupLatlng=this._latlng,this.setLatLng(t)),this._group._featureGroup.addLayer(this)},_recursivelyAnimateChildrenIn:function(t,e,i){this._recursively(t,0,i-1,function(t){var i,n,r=t._markers;for(i=r.length-1;i>=0;i--)n=r[i],n._icon&&(n._setPos(e),n.setOpacity(0))},function(t){var i,n,r=t._childClusters;for(i=r.length-1;i>=0;i--)n=r[i],n._icon&&(n._setPos(e),n.setOpacity(0))})},_recursivelyAnimateChildrenInAndAddSelfToMap:function(t,e,i){this._recursively(t,i,0,function(n){n._recursivelyAnimateChildrenIn(t,n._group._map.latLngToLayerPoint(n.getLatLng()).round(),e),n._isSingleParent()&&e-1===i?(n.setOpacity(1),n._recursivelyRemoveChildrenFromMap(t,e)):n.setOpacity(0),n._addToMap()})},_recursivelyBecomeVisible:function(t,e){this._recursively(t,0,e,null,function(t){t.setOpacity(1)})},_recursivelyAddChildrenToMap:function(t,e,i){this._recursively(i,-1,e,function(n){if(e!==n._zoom)for(var r=n._markers.length-1;r>=0;r--){var s=n._markers[r];i.contains(s._latlng)&&(t&&(s._backupLatlng=s.getLatLng(),s.setLatLng(t),s.setOpacity&&s.setOpacity(0)),n._group._featureGroup.addLayer(s))}},function(e){e._addToMap(t)})},_recursivelyRestoreChildPositions:function(t){for(var e=this._markers.length-1;e>=0;e--){var i=this._markers[e];i._backupLatlng&&(i.setLatLng(i._backupLatlng),delete i._backupLatlng)}if(t-1===this._zoom)for(var n=this._childClusters.length-1;n>=0;n--)this._childClusters[n]._restorePosition();else for(var r=this._childClusters.length-1;r>=0;r--)this._childClusters[r]._recursivelyRestoreChildPositions(t)},_restorePosition:function(){this._backupLatlng&&(this.setLatLng(this._backupLatlng),delete this._backupLatlng)},_recursivelyRemoveChildrenFromMap:function(t,e,i){var n,r;this._recursively(t,-1,e-1,function(t){for(r=t._markers.length-1;r>=0;r--)n=t._markers[r],i&&i.contains(n._latlng)||(t._group._featureGroup.removeLayer(n),n.setOpacity&&n.setOpacity(1))},function(t){for(r=t._childClusters.length-1;r>=0;r--)n=t._childClusters[r],i&&i.contains(n._latlng)||(t._group._featureGroup.removeLayer(n),n.setOpacity&&n.setOpacity(1))})},_recursively:function(t,e,i,n,r){var s,o,a=this._childClusters,_=this._zoom;if(e>_)for(s=a.length-1;s>=0;s--)o=a[s],t.intersects(o._bounds)&&o._recursively(t,e,i,n,r);else if(n&&n(this),r&&this._zoom===i&&r(this),i>_)for(s=a.length-1;s>=0;s--)o=a[s],t.intersects(o._bounds)&&o._recursively(t,e,i,n,r)},_recalculateBounds:function(){var t,e=this._markers,i=this._childClusters;for(this._bounds=new L.LatLngBounds,delete this._wLatLng,t=e.length-1;t>=0;t--)this._expandBounds(e[t]);for(t=i.length-1;t>=0;t--)this._expandBounds(i[t])},_isSingleParent:function(){return this._childClusters.length>0&&this._childClusters[0]._childCount===this._childCount}}),L.DistanceGrid=function(t){this._cellSize=t,this._sqCellSize=t*t,this._grid={},this._objectPoint={}},L.DistanceGrid.prototype={addObject:function(t,e){var i=this._getCoord(e.x),n=this._getCoord(e.y),r=this._grid,s=r[n]=r[n]||{},o=s[i]=s[i]||[],a=L.Util.stamp(t);this._objectPoint[a]=e,o.push(t)},updateObject:function(t,e){this.removeObject(t),this.addObject(t,e)},removeObject:function(t,e){var i,n,r=this._getCoord(e.x),s=this._getCoord(e.y),o=this._grid,a=o[s]=o[s]||{},_=a[r]=a[r]||[];for(delete this._objectPoint[L.Util.stamp(t)],i=0,n=_.length;n>i;i++)if(_[i]===t)return _.splice(i,1),1===n&&delete a[r],!0},eachObject:function(t,e){var i,n,r,s,o,a,_,h=this._grid;for(i in h){o=h[i];for(n in o)for(a=o[n],r=0,s=a.length;s>r;r++)_=t.call(e,a[r]),_&&(r--,s--)}},getNearObject:function(t){var e,i,n,r,s,o,a,_,h=this._getCoord(t.x),u=this._getCoord(t.y),l=this._objectPoint,d=this._sqCellSize,p=null;for(e=u-1;u+1>=e;e++)if(r=this._grid[e])for(i=h-1;h+1>=i;i++)if(s=r[i])for(n=0,o=s.length;o>n;n++)a=s[n],_=this._sqDist(l[L.Util.stamp(a)],t),d>_&&(d=_,p=a);return p},_getCoord:function(t){return Math.floor(t/this._cellSize)},_sqDist:function(t,e){var i=e.x-t.x,n=e.y-t.y;return i*i+n*n}},function(){L.QuickHull={getDistant:function(t,e){var i=e[1].lat-e[0].lat,n=e[0].lng-e[1].lng;return n*(t.lat-e[0].lat)+i*(t.lng-e[0].lng)},findMostDistantPointFromBaseLine:function(t,e){var i,n,r,s=0,o=null,a=[];for(i=e.length-1;i>=0;i--)n=e[i],r=this.getDistant(n,t),r>0&&(a.push(n),r>s&&(s=r,o=n));return{maxPoint:o,newPoints:a}},buildConvexHull:function(t,e){var i=[],n=this.findMostDistantPointFromBaseLine(t,e);return n.maxPoint?(i=i.concat(this.buildConvexHull([t[0],n.maxPoint],n.newPoints)),i=i.concat(this.buildConvexHull([n.maxPoint,t[1]],n.newPoints))):[t]},getConvexHull:function(t){var e,i=!1,n=!1,r=null,s=null;for(e=t.length-1;e>=0;e--){var o=t[e];(i===!1||o.lat>i)&&(r=o,i=o.lat),(n===!1||o.lat<n)&&(s=o,n=o.lat)}var a=[].concat(this.buildConvexHull([s,r],t),this.buildConvexHull([r,s],t));return a}}}(),L.MarkerCluster.include({getConvexHull:function(){var t,e,i,n=this.getAllChildMarkers(),r=[],s=[];for(i=n.length-1;i>=0;i--)e=n[i].getLatLng(),r.push(e);for(t=L.QuickHull.getConvexHull(r),i=t.length-1;i>=0;i--)s.push(t[i][0]);return s}}),L.MarkerCluster.include({_2PI:2*Math.PI,_circleFootSeparation:25,_circleStartAngle:Math.PI/6,_spiralFootSeparation:28,_spiralLengthStart:11,_spiralLengthFactor:5,_circleSpiralSwitchover:9,spiderfy:function(){if(this._group._spiderfied!==this&&!this._group._inZoomAnimation){var t,e=this.getAllChildMarkers(),i=this._group,n=i._map,r=n.latLngToLayerPoint(this._latlng);this._group._unspiderfy(),this._group._spiderfied=this,e.length>=this._circleSpiralSwitchover?t=this._generatePointsSpiral(e.length,r):(r.y+=10,t=this._generatePointsCircle(e.length,r)),this._animationSpiderfy(e,t)}},unspiderfy:function(t){this._group._inZoomAnimation||(this._animationUnspiderfy(t),this._group._spiderfied=null)},_generatePointsCircle:function(t,e){var i,n,r=this._group.options.spiderfyDistanceMultiplier*this._circleFootSeparation*(2+t),s=r/this._2PI,o=this._2PI/t,a=[];for(a.length=t,i=t-1;i>=0;i--)n=this._circleStartAngle+i*o,a[i]=new L.Point(e.x+s*Math.cos(n),e.y+s*Math.sin(n))._round();return a},_generatePointsSpiral:function(t,e){var i,n=this._group.options.spiderfyDistanceMultiplier*this._spiralLengthStart,r=this._group.options.spiderfyDistanceMultiplier*this._spiralFootSeparation,s=this._group.options.spiderfyDistanceMultiplier*this._spiralLengthFactor,o=0,a=[];for(a.length=t,i=t-1;i>=0;i--)o+=r/n+5e-4*i,a[i]=new L.Point(e.x+n*Math.cos(o),e.y+n*Math.sin(o))._round(),n+=this._2PI*s/o;return a},_noanimationUnspiderfy:function(){var t,e,i=this._group,n=i._map,r=i._featureGroup,s=this.getAllChildMarkers();for(this.setOpacity(1),e=s.length-1;e>=0;e--)t=s[e],r.removeLayer(t),t._preSpiderfyLatlng&&(t.setLatLng(t._preSpiderfyLatlng),delete t._preSpiderfyLatlng),t.setZIndexOffset(0),t._spiderLeg&&(n.removeLayer(t._spiderLeg),delete t._spiderLeg)}}),L.MarkerCluster.include(L.DomUtil.TRANSITION?{SVG_ANIMATION:function(){return e.createElementNS("http://www.w3.org/2000/svg","animate").toString().indexOf("SVGAnimate")>-1}(),_animationSpiderfy:function(t,i){var n,r,s,o,a=this,_=this._group,h=_._map,u=_._featureGroup,l=h.latLngToLayerPoint(this._latlng);for(n=t.length-1;n>=0;n--)r=t[n],r.setZIndexOffset(1e6),r.setOpacity(0),u.addLayer(r),r._setPos(l);_._forceLayout(),_._animationStart();var d=L.Path.SVG?0:.3,p=L.Path.SVG_NS;for(n=t.length-1;n>=0;n--)if(o=h.layerPointToLatLng(i[n]),r=t[n],r._preSpiderfyLatlng=r._latlng,r.setLatLng(o),r.setOpacity(1),s=new L.Polyline([a._latlng,o],{weight:1.5,color:"#222",opacity:d}),h.addLayer(s),r._spiderLeg=s,L.Path.SVG&&this.SVG_ANIMATION){var c=s._path.getTotalLength();s._path.setAttribute("stroke-dasharray",c+","+c);var m=e.createElementNS(p,"animate");m.setAttribute("attributeName","stroke-dashoffset"),m.setAttribute("begin","indefinite"),m.setAttribute("from",c),m.setAttribute("to",0),m.setAttribute("dur",.25),s._path.appendChild(m),m.beginElement(),m=e.createElementNS(p,"animate"),m.setAttribute("attributeName","stroke-opacity"),m.setAttribute("attributeName","stroke-opacity"),m.setAttribute("begin","indefinite"),m.setAttribute("from",0),m.setAttribute("to",.5),m.setAttribute("dur",.25),s._path.appendChild(m),m.beginElement()}if(a.setOpacity(.3),L.Path.SVG)for(this._group._forceLayout(),n=t.length-1;n>=0;n--)r=t[n]._spiderLeg,r.options.opacity=.5,r._path.setAttribute("stroke-opacity",.5);setTimeout(function(){_._animationEnd(),_.fire("spiderfied")},200)},_animationUnspiderfy:function(t){var e,i,n,r=this._group,s=r._map,o=r._featureGroup,a=t?s._latLngToNewLayerPoint(this._latlng,t.zoom,t.center):s.latLngToLayerPoint(this._latlng),_=this.getAllChildMarkers(),h=L.Path.SVG&&this.SVG_ANIMATION;for(r._animationStart(),this.setOpacity(1),i=_.length-1;i>=0;i--)e=_[i],e._preSpiderfyLatlng&&(e.setLatLng(e._preSpiderfyLatlng),delete e._preSpiderfyLatlng,e._setPos(a),e.setOpacity(0),h&&(n=e._spiderLeg._path.childNodes[0],n.setAttribute("to",n.getAttribute("from")),n.setAttribute("from",0),n.beginElement(),n=e._spiderLeg._path.childNodes[1],n.setAttribute("from",.5),n.setAttribute("to",0),n.setAttribute("stroke-opacity",0),n.beginElement(),e._spiderLeg._path.setAttribute("stroke-opacity",0)));setTimeout(function(){var t=0;for(i=_.length-1;i>=0;i--)e=_[i],e._spiderLeg&&t++;for(i=_.length-1;i>=0;i--)e=_[i],e._spiderLeg&&(e.setOpacity(1),e.setZIndexOffset(0),t>1&&o.removeLayer(e),s.removeLayer(e._spiderLeg),delete e._spiderLeg);r._animationEnd()},200)}}:{_animationSpiderfy:function(t,e){var i,n,r,s,o=this._group,a=o._map,_=o._featureGroup;for(i=t.length-1;i>=0;i--)s=a.layerPointToLatLng(e[i]),n=t[i],n._preSpiderfyLatlng=n._latlng,n.setLatLng(s),n.setZIndexOffset(1e6),_.addLayer(n),r=new L.Polyline([this._latlng,s],{weight:1.5,color:"#222"}),a.addLayer(r),n._spiderLeg=r;this.setOpacity(.3),o.fire("spiderfied")},_animationUnspiderfy:function(){this._noanimationUnspiderfy()}}),L.MarkerClusterGroup.include({_spiderfied:null,_spiderfierOnAdd:function(){this._map.on("click",this._unspiderfyWrapper,this),this._map.options.zoomAnimation?this._map.on("zoomstart",this._unspiderfyZoomStart,this):this._map.on("zoomend",this._unspiderfyWrapper,this),L.Path.SVG&&!L.Browser.touch&&this._map._initPathRoot()},_spiderfierOnRemove:function(){this._map.off("click",this._unspiderfyWrapper,this),this._map.off("zoomstart",this._unspiderfyZoomStart,this),this._map.off("zoomanim",this._unspiderfyZoomAnim,this),this._unspiderfy()},_unspiderfyZoomStart:function(){this._map&&this._map.on("zoomanim",this._unspiderfyZoomAnim,this)},_unspiderfyZoomAnim:function(t){L.DomUtil.hasClass(this._map._mapPane,"leaflet-touching")||(this._map.off("zoomanim",this._unspiderfyZoomAnim,this),this._unspiderfy(t))},_unspiderfyWrapper:function(){this._unspiderfy()},_unspiderfy:function(t){this._spiderfied&&this._spiderfied.unspiderfy(t)},_noanimationUnspiderfy:function(){this._spiderfied&&this._spiderfied._noanimationUnspiderfy()},_unspiderfyLayer:function(t){t._spiderLeg&&(this._featureGroup.removeLayer(t),t.setOpacity(1),t.setZIndexOffset(0),this._map.removeLayer(t._spiderLeg),delete t._spiderLeg)}})}(window,document);