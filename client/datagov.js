
// counter starts at 0
cityColors = {"Bangalore": "green","Boston": "orange","Rio de Janeiro": "gray","San Francisco": "red","Shanghai": "yellow","Singapore": "black"};
Template.aggregateData.created = function(){
  // leaflet provider extension code... probabably only pick what i'm going to use 
  // eventually... https://github.com/leaflet-extras/leaflet-providers
(function () {
  'use strict';

  L.TileLayer.Provider = L.TileLayer.extend({
    initialize: function (arg, options) {
      var providers = L.TileLayer.Provider.providers;

      var parts = arg.split('.');

      var providerName = parts[0];
      var variantName = parts[1];

      if (!providers[providerName]) {
        throw 'No such provider (' + providerName + ')';
      }

      var provider = {
        url: providers[providerName].url,
        options: providers[providerName].options
      };

      // overwrite values in provider from variant.
      if (variantName && 'variants' in providers[providerName]) {
        if (!(variantName in providers[providerName].variants)) {
          throw 'No such variant of ' + providerName + ' (' + variantName + ')';
        }
        var variant = providers[providerName].variants[variantName];
        var variantOptions;
        if (typeof variant === 'string') {
          variantOptions = {
            variant: variant
          };
        } else {
          variantOptions = variant.options;
        }
        provider = {
          url: variant.url || provider.url,
          options: L.Util.extend({}, provider.options, variantOptions)
        };
      } else if (typeof provider.url === 'function') {
        provider.url = provider.url(parts.splice(1, parts.length - 1).join('.'));
      }

      var forceHTTP = window.location.protocol === 'file:' || provider.options.forceHTTP;
      if (provider.url.indexOf('//') === 0 && forceHTTP) {
        provider.url = 'http:' + provider.url;
      }

      // replace attribution placeholders with their values from toplevel provider attribution,
      // recursively
      var attributionReplacer = function (attr) {
        if (attr.indexOf('{attribution.') === -1) {
          return attr;
        }
        return attr.replace(/\{attribution.(\w*)\}/,
          function (match, attributionName) {
            return attributionReplacer(providers[attributionName].options.attribution);
          }
        );
      };
      provider.options.attribution = attributionReplacer(provider.options.attribution);

      // Compute final options combining provider options with any user overrides
      var layerOpts = L.Util.extend({}, provider.options, options);
      L.TileLayer.prototype.initialize.call(this, provider.url, layerOpts);
    }
  });

  /**
   * Definition of providers.
   * see http://leafletjs.com/reference.html#tilelayer for options in the options map.
   */

  L.TileLayer.Provider.providers = {
    OpenStreetMap: {
      url: '//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      options: {
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      },
      variants: {
        Mapnik: {},
        BlackAndWhite: {
          url: 'http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png'
        },
        DE: {
          url: 'http://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png'
        },
        HOT: {
          url: 'http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
          options: {
            attribution: '{attribution.OpenStreetMap}, Tiles courtesy of <a href="http://hot.openstreetmap.org/" target="_blank">Humanitarian OpenStreetMap Team</a>'
          }
        }
      }
    },
    OpenSeaMap: {
      url: 'http://tiles.openseamap.org/seamark/{z}/{x}/{y}.png',
      options: {
        attribution: 'Map data: &copy; <a href="http://www.openseamap.org">OpenSeaMap</a> contributors'
      }
    },
    Thunderforest: {
      url: '//{s}.tile.thunderforest.com/{variant}/{z}/{x}/{y}.png',
      options: {
        attribution:
          '&copy; <a href="http://www.opencyclemap.org">OpenCycleMap</a>, {attribution.OpenStreetMap}',
        variant: 'cycle'
      },
      variants: {
        OpenCycleMap: 'cycle',
        Transport: 'transport',
        TransportDark: 'transport-dark',
        Landscape: 'landscape',
        Outdoors: 'outdoors'
      }
    },
    OpenMapSurfer: {
      url: 'http://openmapsurfer.uni-hd.de/tiles/{variant}/x={x}&y={y}&z={z}',
      options: {
        minZoom: 0,
        maxZoom: 20,
        variant: 'roads',
        attribution: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a> &mdash; Map data {attribution.OpenStreetMap}'
      },
      variants: {
        Roads: 'roads',
        AdminBounds: {
          options: {
            variant: 'adminb',
            maxZoom: 19
          }
        },
        Grayscale: {
          options: {
            variant: 'roadsg',
            maxZoom: 19
          }
        }
      }
    },
    Hydda: {
      url: 'http://{s}.tile.openstreetmap.se/hydda/{variant}/{z}/{x}/{y}.png',
      options: {
        minZoom: 0,
        maxZoom: 18,
        variant: 'full',
        attribution: 'Tiles courtesy of <a href="http://openstreetmap.se/" target="_blank">OpenStreetMap Sweden</a> &mdash; Map data {attribution.OpenStreetMap}'
      },
      variants: {
        Full: 'full',
        Base: 'base',
        RoadsAndLabels: 'roads_and_labels'
      }
    },
    MapQuestOpen: {
      url: 'http://otile{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpeg',
      options: {
        attribution:
          'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> &mdash; ' +
          'Map data {attribution.OpenStreetMap}',
        subdomains: '1234'
      },
      variants: {
        OSM: {},
        Aerial: {
          url: 'http://oatile{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.jpg',
          options: {
            attribution:
              'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> &mdash; ' +
              'Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency'
          }
        }
      }
    },
    MapBox: {
      url: function (id) {
        return 'http://{s}.tiles.mapbox.com/v3/' + id + '/{z}/{x}/{y}.png';
      },
      options: {
        attribution:
          'Imagery from <a href="http://mapbox.com/about/maps/">MapBox</a> &mdash; ' +
          'Map data {attribution.OpenStreetMap}',
        subdomains: 'abcd'
      }
    },
    Stamen: {
      url: 'http://{s}.tile.stamen.com/{variant}/{z}/{x}/{y}.png',
      options: {
        attribution:
          'Map tiles by <a href="http://stamen.com">Stamen Design</a>, ' +
          '<a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; ' +
          'Map data {attribution.OpenStreetMap}',
        subdomains: 'abcd',
        minZoom: 0,
        maxZoom: 20,
        variant: 'toner'
      },
      variants: {
        Toner: 'toner',
        TonerBackground: 'toner-background',
        TonerHybrid: 'toner-hybrid',
        TonerLines: 'toner-lines',
        TonerLabels: 'toner-labels',
        TonerLite: 'toner-lite',
        Terrain: {
          options: {
            variant: 'terrain',
            minZoom: 4,
            maxZoom: 18
          }
        },
        TerrainBackground: {
          options: {
            variant: 'terrain-background',
            minZoom: 4,
            maxZoom: 18
          }
        },
        Watercolor: {
          options: {
            variant: 'watercolor',
            minZoom: 1,
            maxZoom: 16
          }
        }
      }
    },
    Esri: {
      url: '//server.arcgisonline.com/ArcGIS/rest/services/{variant}/MapServer/tile/{z}/{y}/{x}',
      options: {
        variant: 'World_Street_Map',
        attribution: 'Tiles &copy; Esri'
      },
      variants: {
        WorldStreetMap: {
          options: {
            attribution:
              '{attribution.Esri} &mdash; ' +
              'Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
          }
        },
        DeLorme: {
          options: {
            variant: 'Specialty/DeLorme_World_Base_Map',
            minZoom: 1,
            maxZoom: 11,
            attribution: '{attribution.Esri} &mdash; Copyright: &copy;2012 DeLorme'
          }
        },
        WorldTopoMap: {
          options: {
            variant: 'World_Topo_Map',
            attribution:
              '{attribution.Esri} &mdash; ' +
              'Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
          }
        },
        WorldImagery: {
          options: {
            variant: 'World_Imagery',
            attribution:
              '{attribution.Esri} &mdash; ' +
              'Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
          }
        },
        WorldTerrain: {
          options: {
            variant: 'World_Terrain_Base',
            maxZoom: 13,
            attribution:
              '{attribution.Esri} &mdash; ' +
              'Source: USGS, Esri, TANA, DeLorme, and NPS'
          }
        },
        WorldShadedRelief: {
          options: {
            variant: 'World_Shaded_Relief',
            maxZoom: 13,
            attribution: '{attribution.Esri} &mdash; Source: Esri'
          }
        },
        WorldPhysical: {
          options: {
            variant: 'World_Physical_Map',
            maxZoom: 8,
            attribution: '{attribution.Esri} &mdash; Source: US National Park Service'
          }
        },
        OceanBasemap: {
          options: {
            variant: 'Ocean_Basemap',
            maxZoom: 13,
            attribution: '{attribution.Esri} &mdash; Sources: GEBCO, NOAA, CHS, OSU, UNH, CSUMB, National Geographic, DeLorme, NAVTEQ, and Esri'
          }
        },
        NatGeoWorldMap: {
          options: {
            variant: 'NatGeo_World_Map',
            maxZoom: 16,
            attribution: '{attribution.Esri} &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC'
          }
        },
        WorldGrayCanvas: {
          options: {
            variant: 'Canvas/World_Light_Gray_Base',
            maxZoom: 16,
            attribution: '{attribution.Esri} &mdash; Esri, DeLorme, NAVTEQ'
          }
        }
      }
    },
    OpenWeatherMap: {
      url: 'http://{s}.tile.openweathermap.org/map/{variant}/{z}/{x}/{y}.png',
      options: {
        attribution: 'Map data &copy; <a href="http://openweathermap.org">OpenWeatherMap</a>',
        opacity: 0.5
      },
      variants: {
        Clouds: 'clouds',
        CloudsClassic: 'clouds_cls',
        Precipitation: 'precipitation',
        PrecipitationClassic: 'precipitation_cls',
        Rain: 'rain',
        RainClassic: 'rain_cls',
        Pressure: 'pressure',
        PressureContour: 'pressure_cntr',
        Wind: 'wind',
        Temperature: 'temp',
        Snow: 'snow'
      }
    },
    HERE: {
      /*
       * HERE maps, formerly Nokia maps.
       * These basemaps are free, but you need an API key. Please sign up at
       * http://developer.here.com/getting-started
       *
       * Note that the base urls contain '.cit' whichs is HERE's
       * 'Customer Integration Testing' environment. Please remove for production
       * envirionments.
       */
      url:
        'http://{s}.{base}.maps.cit.api.here.com/maptile/2.1/' +
        'maptile/{mapID}/{variant}/{z}/{x}/{y}/256/png8?' +
        'app_id={app_id}&app_code={app_code}',
      options: {
        attribution:
          'Map &copy; 1987-2014 <a href="http://developer.here.com">HERE</a>',
        subdomains: '1234',
        mapID: 'newest',
        'app_id': '<insert your app_id here>',
        'app_code': '<insert your app_code here>',
        base: 'base',
        variant: 'normal.day',
        minZoom: 0,
        maxZoom: 20
      },
      variants: {
        normalDay: 'normal.day',
        normalDayCustom: 'normal.day.custom',
        normalDayGrey: 'normal.day.grey',
        normalDayMobile: 'normal.day.mobile',
        normalDayGreyMobile: 'normal.day.grey.mobile',
        normalDayTransit: 'normal.day.transit',
        normalDayTransitMobile: 'normal.day.transit.mobile',
        normalNight: 'normal.night',
        normalNightMobile: 'normal.night.mobile',
        normalNightGrey: 'normal.night.grey',
        normalNightGreyMobile: 'normal.night.grey.mobile',

        carnavDayGrey: 'carnav.day.grey',
        hybridDay: {
          options: {
            base: 'aerial',
            variant: 'hybrid.day'
          }
        },
        hybridDayMobile: {
          options: {
            base: 'aerial',
            variant: 'hybrid.day.mobile'
          }
        },
        pedestrianDay: 'pedestrian.day',
        pedestrianNight: 'pedestrian.night',
        satelliteDay: {
          options: {
            base: 'aerial',
            variant: 'satellite.day'
          }
        },
        terrainDay: {
          options: {
            base: 'aerial',
            variant: 'terrain.day'
          }
        },
        terrainDayMobile: {
          options: {
            base: 'aerial',
            variant: 'terrain.day.mobile'
          }
        }
      }
    },
    Acetate: {
      url: 'http://a{s}.acetate.geoiq.com/tiles/{variant}/{z}/{x}/{y}.png',
      options: {
        attribution:
          '&copy;2012 Esri & Stamen, Data from OSM and Natural Earth',
        subdomains: '0123',
        minZoom: 2,
        maxZoom: 18,
        variant: 'acetate-base'
      },
      variants: {
        basemap: 'acetate-base',
        terrain: 'terrain',
        all: 'acetate-hillshading',
        foreground: 'acetate-fg',
        roads: 'acetate-roads',
        labels: 'acetate-labels',
        hillshading: 'hillshading'
      }
    },
    FreeMapSK: {
      url: 'http://{s}.freemap.sk/T/{z}/{x}/{y}.jpeg',
      options: {
        minZoom: 8,
        maxZoom: 16,
        subdomains: ['t1', 't2', 't3', 't4'],
        attribution:
          '{attribution.OpenStreetMap}, vizualization CC-By-SA 2.0 <a href="http://freemap.sk">Freemap.sk</a>'
      }
    },
    MtbMap: {
      url: 'http://tile.mtbmap.cz/mtbmap_tiles/{z}/{x}/{y}.png',
      options: {
        attribution:
          '{attribution.OpenStreetMap} &amp; USGS'
      }
    },
    CartoDB: {
      url: 'http://{s}.basemaps.cartocdn.com/{variant}/{z}/{x}/{y}.png',
      options: {
        attribution: '{attribution.OpenStreetMap} &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
        subdomains: 'abcd',
        minZoom: 0,
        maxZoom: 18,
        variant: 'light_all'
      },
      variants: {
        Positron: 'light_all',
        PositronNoLabels: 'light_nolabels',
        DarkMatter: 'dark_all',
        DarkMatterNoLabels: 'dark_nolabels'
      }
    },
    HikeBike: {
      url: 'http://{s}.tiles.wmflabs.org/hikebike/{z}/{x}/{y}.png',
      options: {
        attribution: '{attribution.OpenStreetMap}'
      }
    },
    BasemapAT: {
      url: '//maps{s}.wien.gv.at/basemap/{variant}/normal/google3857/{z}/{y}/{x}.{format}',
      options: {
        attribution: 'Datenquelle: <a href="www.basemap.at">basemap.at</a>',
        subdomains: ['', '1', '2', '3', '4'],
        bounds: [[46.358770, 8.782379], [49.037872, 17.189532]]
      },
      variants: {
        basemap: {
          options: {
            variant: 'geolandbasemap',
            format: 'jpeg'
          }
        },
        highdpi: {
          options: {
            variant: 'bmaphidpi',
            format: 'jpeg'
          }
        },
        grau: {
          options: {
            variant: 'bmapgrau',
            format: 'png'
          }
        },
        overlay: {
          options: {
            variant: 'bmapoverlay',
            format: 'png'
          }
        },
        orthofoto: {
          options: {
            variant: 'bmaporthofoto30cm',
            format: 'jpeg'
          }
        }
      }
    },
    NASAGIBS: {
      url: '//map1.vis.earthdata.nasa.gov/wmts-webmerc/{variant}/default/{time}/{tilematrixset}{maxZoom}/{z}/{y}/{x}.{format}',
      options: {
        attribution:
          'Imagery provided by services from the Global Imagery Browse Services (GIBS), operated by the NASA/GSFC/Earth Science Data and Information System ' +
          '(<a href="https://earthdata.nasa.gov">ESDIS</a>) with funding provided by NASA/HQ.',
        bounds: [[-85.0511287776, -179.999999975], [85.0511287776, 179.999999975]],
        minZoom: 1,
        maxZoom: 9,
        format: 'jpg',
        time: '',
        tilematrixset: 'GoogleMapsCompatible_Level'
      },
      variants: {
        ModisTerraTrueColorCR: 'MODIS_Terra_CorrectedReflectance_TrueColor',
        ModisTerraBands367CR: 'MODIS_Terra_CorrectedReflectance_Bands367',
        ViirsEarthAtNight2012: {
          options: {
            variant: 'VIIRS_CityLights_2012',
            maxZoom: 8
          }
        },
        ModisTerraLSTDay: {
          options: {
            variant: 'MODIS_Terra_Land_Surface_Temp_Day',
            format: 'png',
            maxZoom: 7,
            opacity: 0.75
          }
        },
        ModisTerraSnowCover: {
          options: {
            variant: 'MODIS_Terra_Snow_Cover',
            format: 'png',
            maxZoom: 8,
            opacity: 0.75
          }
        },
        ModisTerraAOD: {
          options: {
            variant: 'MODIS_Terra_Aerosol',
            format: 'png',
            maxZoom: 6,
            opacity: 0.75
          }
        },
        ModisTerraChlorophyll: {
          options: {
            variant: 'MODIS_Terra_Chlorophyll_A',
            format: 'png',
            maxZoom: 7,
            opacity: 0.75
          }
        }
      }
    }
  };

  L.tileLayer.provider = function (provider, options) {
    return new L.TileLayer.Provider(provider, options);
  };
}());
};
Template.aggregateData.rendered = function(){

  map = L.map('map').setView([0,0], 2);
  L.tileLayer.provider('Stamen.Watercolor').addTo(map);
  map._initPathRoot();


  var svg = d3.select("#map").select("svg"),
   g = svg.append("g");
   
   d3.json("/cityList2.json", function(collection) {
    console.log(collection);
    // Add a LatLng object to each item in the dataset
    collection.objects.forEach(function(d) {
     d.LatLng = new L.LatLng(d.circle.coordinates[0],
        d.circle.coordinates[1])
    })
    
    var feature = g.selectAll("circle")
     .data(collection.objects)
     .enter().append("circle")
     .style("stroke", "black")  
     .style("opacity", .6) 
     .style("fill", function(d){
      console.log(d);
      if(typeof d.circle != "undefined" && typeof d.circle.color != "undefined"){
        // build global color object?
     
        // dry get colors does this already... hmmmm
       
        return d.circle.color;
      }
      return 'black';
     })
     .attr("r", 20);  

    map.on("viewreset", update);
    update();


     feature.on('click',function(d){
      /// toggle action!!
      // maybe pull up dialog to filter results via time, date, city ...
        if(Session.equals("selectedCity",d.circle.city)){
          // reset
          Session.set("selectedCity",false);
          map.setView([0,0], 2);
          return true;
        }
        Session.set("selectedCity",d.circle.city);
        var loc = d.circle.coordinates;
        if(loc){
          map.setView([loc[0],loc[1]], 4);
        }
    }); 

    function update() {
     feature.attr("transform", 
     function(d) { 
         return "translate("+ 
      map.latLngToLayerPoint(d.LatLng).x +","+ 
      map.latLngToLayerPoint(d.LatLng).y +")";
         }
     )
    }
   })  

};



Template.aggregateData.helpers({
  getData: function () {
    // ...
    if(typeof dataset == "undefined"){
      return false;
    }
    renderLegend();
    var selectedCity = Session.get('selectedCity');
    var entryFilter = Session.get("entryFilter");

    if(typeof entryFilter == "undefined" || !entryFilter){
      entryFilter = 25;
    }else{
      entryFilter = parseInt(entryFilter);
    }
    if(typeof selectedCity != "undefined" && selectedCity){
      return dataset.find({city : selectedCity},{sort : {timestamp: 1 },limit : entryFilter }).fetch();
    }else{
      // else do a software side sort of city to enforce city order
      // return everything grouped by city? like an arrays []
      var data = dataset.find({},{sort: {timestamp: 1}}).fetch();
    }
    var byCity = {};

    data.filter(function(o,i){
      if(typeof byCity[o.city] == "undefined"){
        byCity[o.city] = [];
      }
      byCity[o.city].push(o);
    });
    
    var r = [];
    var cities = _.keys(byCity);
    if(typeof byCity[cities[0]] != "undefined"){

      for (var i = 0; i < entryFilter; i++) {
        cities.filter(function(cityName){
          r.push(byCity[cityName][i]);
        });
      }
      return r;
      // now add this data as a marker???
    }else{
      return [];
    }
  }
});


Template.sampleCSV.helpers({
  getRows: function () {
    // ...
    return dataset.find();
  }
});


Template.singlePlot.destroyed = function(){
  if(typeof this.data == "undefined" && typeof this.city != "undefined"){
    var GUID = moment(this.timestamp).format('YYYMMDDTHHMMSS') + this.city.split(' ').join();
  }else if(typeof this.data != "undefined" && typeof this.data.city != "undefined"){
    var GUID = moment(this.data.timestamp).format('YYYMMDDTHHMMSS') + this.data.city.split(' ').join('');
  }else{
    // console.log('nothing to destroy');
    return false;
  }
//  console.log(GUID);
  d3.selectAll(".pie_" +  GUID ).remove();
  d3.selectAll(".arc_" + GUID ).remove();
  return true;
}

var colorRange = function(aDataset){

  var color = d3.scale.ordinal()
      .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

  color.domain(d3.keys(aDataset).filter(
    // keys to NOT use
    function(key){
      return key !== "city" && key !== "_id" && key !== "op" && key !== "resolution" && key !== "timestamp";
    })
  );
  return color;
}
Template.singlePlot.rendered = function(){
  if(typeof this.data == "undefined"){
    return false;
  }

  var data = [this.data];
  var color = colorRange(this.data);
  // build a range for the cities????
  // dont need a foreach :()
/*

** Code relating to transitons

.delay(function(d, i) { return i / n * duration; })

*/
  data.forEach(function(d){
    d.fields = color.domain().map(function(name){
      if(typeof d[name != "undefined"]){
        return {name:name, val: parseFloat(d[name])}
      }
      // hmmm validation???
      return {};
    })
  });
  var radius = 55,
      padding = 0;
  var GUID = moment(this.data.timestamp).format('YYYMMDDTHHMMSS') + this.data.city.split(' ').join('');
  var arc = d3.svg.arc()
      .outerRadius(radius)
      .innerRadius(radius - 30);


  var pie = d3.layout.pie()
      .sort(null)
      // swap out population value
      .value(function(d) { return d.val; });





      // ATTACH A CLICK ACTION
    var svg = d3.select("d3data").append("pie")
        .data(data)
      .enter().append("svg")
        .attr("class", "graph pie_" + GUID)
        .attr("width", radius * 2)
        .attr("height", radius * 2)
      .append("g")
        .attr("transform", "translate(" + radius + "," + radius + ")");

    svg.selectAll("arc" )
        .data(function(d) {
          // returns the size of the arc within the fields
          console.log(pie);
         return pie(d.fields); 
       })
      .enter().append("path")
        .attr("class", "arc_" + GUID) 
        .attr("d", arc)
        .style("fill", function(d) { return color(d.data.name); })
        .transition().delay(function(d, i) { return i * 500; }).duration(500)
          .attrTween('d', function(d) {
               var i = d3.interpolate(d.startAngle+0.1, d.endAngle);
               return function(t) {
                   d.endAngle = i(t);
                 return arc(d);
               }
          })
        ;
  
    svg.append("text")
        .attr("dy", ".45em")
        .style("text-anchor", "middle").style("fill",function(d){
          if(typeof cityColors[d.city] != "undefined"){
            return cityColors[d.city];
          }
          return 'black';
//          return d.circle.color;
        })
        .text(function(d) { 
          // color code the city....
          return (   moment(d.timestamp).format('M-D h a')  ) ; 
        });

    svg.on('click',function(d){
      /// toggle action!!
      // maybe pull up dialog to filter results via time, date, city ...
        Session.set("selectedTime",moment(d.timestamp).format());
    }); 


};
renderLegend = function (obj) {
  var radius = 74,
      padding = 10;

  var color = colorRange(obj);
  // dynamically generates legend keys based on
  // keys to NOT graph...
  // to do .. checkboxes to graph the other data to create custom comparisons
  var legend = d3.select("body").append("svg")
      .attr("class", "legend")
      .attr("width", radius * 2)
      .attr("height", radius * 2)
    .selectAll("g")
      .data(color.domain().slice().reverse())
    .enter().append("g")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legend.append("rect")
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color);

  legend.append("text")
      .attr("x", 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .text(function(d) { return d; });
};