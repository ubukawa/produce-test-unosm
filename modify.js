const geojsonArea = require('@mapbox/geojson-area')

const preProcess = (f) => {
  f.tippecanoe = {
    layer: 'other',
    minzoom: 15,
    maxzoom: 15
  }
  // name
  if (
    f.properties.hasOwnProperty('en_name') ||
    f.properties.hasOwnProperty('int_name') ||
    f.properties.hasOwnProperty('name') ||
    f.properties.hasOwnProperty('ar_name')
  ) {
    let name = ''
    if (f.properties['en_name']) {
      name = f.properties['en_name']
    } else if (f.properties['int_name']) {
      name = f.properties['int_name']
    } else if (f.properties['name']) {
      name = f.properties['name']
    } else {
      name = f.properties['ar_name']
    }
    delete f.properties['en_name']
    delete f.properties['ar_name']
    delete f.properties['int_name']
    delete f.properties['name']
    f.properties.name = name
  }
  return f
}

const postProcess = (f) => {
  delete f.properties['_database']
  delete f.properties['_table']
  return f
}

const flap = (f, defaultZ) => {
  switch (f.geometry.type) {
    case 'MultiPolygon':
    case 'Polygon':
      let mz = Math.floor(
        19 - Math.log2(geojsonArea.geometry(f.geometry)) / 2
      )
      if (mz > 15) { mz = 15 }
      if (mz < 6) { mz = 6 }
      return mz
    default:
      return defaultZ ? defaultZ : 10
  }
}

const minzoomRoad = (f) => {
  switch (f.properties.fclass) {
    case 'path':
    case 'pedestrian':
    case 'footway':
    case 'cycleway':
    case 'living_street':
    case 'steps':
    case 'bridleway':
      return 13
    case 'residential':
    case 'service':
    case 'track':
    case 'unclassified':
      return 11
    case 'road':
    case 'tertiary_link':
      return 10
    case 'tertiary':
    case 'secondary_link':
      return 9
    case 'secondary':
    case 'primary_link':
      return 8
    case 'primary':
    case 'trunk_link':
    case 'motorway_link':
      return 7
    case 'motorway':
    case 'trunk':
      return 6
    default:
      return 15
  }
}

const minzoomWater = (f) => {
  if (f.properties.fclass === 'water') {
    return 6
  } else if (f.properties.fclass === 'lake') {
    return 6
  } else if (f.properties.fclass === 'pond') {
    return 6
  } else if (f.properties.fclass === 'glacier') {
    return 6
  } else if (f.properties.fclass === 'riverbank') {
    return 7
  } else if (f.properties.fclass === 'wetland') {
    return 8
  } else if (f.properties.fclass === 'basin') {
    return 9
  } else if (f.properties.fclass === 'reservoir') {
    return 9
  } else {
    throw new Error(`monzoomWater: ${f.properties}`)
  }
}

const lut = {
  // nature
  un_mission_lc_ls: f => {
    f.tippecanoe = {
      layer: 'landcover',
      minzoom: 10,
      maxzoom: 15
    }
  if (f.properties.gridcode !== 20 && f.properties.gridcode !== 30 && f.properties.gridcode !== 80) {
    delete f
  }
    return f
  },
  un_glc30_global_lc_ms: f => {
    f.tippecanoe = {
      layer: 'landcover',
      minzoom: 6,
      maxzoom: 9
    }
    delete f.properties['id']
  if (f.properties.gridcode !== 20 && f.properties.gridcode !== 30 && f.properties.gridcode !== 80) {
    delete f
  }
    return f
  },
  landuse_naturallarge_a: f => {
    f.tippecanoe = {
      layer: 'nature-l',
      minzoom: 11,
      maxzoom: 15
    }
    delete f.properties['class']
    delete f.properties['ungsc_ctry']
    delete f.properties['ungsc_ctry_name']
    delete f.properties['ungsc_mission']
    return f
  },
  landuse_naturalmedium_a: f => {
    f.tippecanoe = {
      layer: 'nature-m',
      minzoom: 8,
      maxzoom: 15
    }
    delete f.properties['class']
    delete f.properties['ungsc_ctry']
    delete f.properties['ungsc_ctry_name']
    delete f.properties['ungsc_mission']
    delete f.properties['traction']
    return f
  },

// 2. water
  custom_planet_ocean_l08: f => {
    f.tippecanoe = {
      layer: 'ocean',
      minzoom: 6,
      maxzoom: 7
    }
    return f
  },
  custom_planet_ocean: f => {
    f.tippecanoe = {
      layer: 'ocean',
      minzoom: 8,
      maxzoom: 15
    } 
    return f
  },
  custom_planet_land_a_l08: f => {
    f.tippecanoe = {
      layer: 'landmass',
      minzoom: 6,
      maxzoom: 7
    }
    return f
  },
  custom_planet_land_a: f => {
    f.tippecanoe = {
      layer: 'landmass',
      minzoom: 8,
      maxzoom: 15
    } 
    return f
  },
  custom_ne_rivers_lakecentrelines: f => {
    f.tippecanoe = {
      layer: 'un_water',
      minzoom: 6,
      maxzoom: 7
    }
    return f
  },
  water_all_a: f => {
    f.tippecanoe = {
      layer: 'watera',
      minzoom: minzoomWater(f),
      maxzoom: 15
    }
    delete f.properties['class']
    delete f.properties['destination']
    delete f.properties['area_km2']
    delete f.properties['length_km']
    delete f.properties['ungsc_ctry']
    if (f.properties.ungsc_mission === 'UNMIK') {
      f.properties.name = ''
    }
    delete f.properties['ungsc_mission']
    delete f.properties['ne_scalerank']
    delete f.properties['ne_name']
    delete f.properties['ne_mission']
    return f
  },
  waterways_small_l: f => {
    f.tippecanoe = {
      layer: 'water',
      minzoom: 7,
      maxzoom: 10
    }
    delete f.properties['class']
    delete f.properties['destination']
    delete f.properties['ungsc_ctry']
    if (f.properties.ungsc_mission === 'UNMIK') {
      f.properties.name = ''
    }
    delete f.properties['ungsc_mission']
    return f
  },
  waterways_large_l: f => {
    f.tippecanoe = {
      layer: 'water',
      minzoom: 11,
      maxzoom: 15
    }
    delete f.properties['class']
    delete f.properties['destination']
    delete f.properties['ungsc_ctry']
    if (f.properties.ungsc_mission === 'UNMIK') {
      f.properties.name = ''
    }
    delete f.properties['ungsc_mission']
    return f
  },
  // 3. boundary
  unhq_bndl: f => {
    f.tippecanoe = {
      layer: 'hq_bnd',
      minzoom: 5,
      maxzoom: 15
    }
    return f
  },
 unhq_bnda_a1: f => {
    f.tippecanoe = {
      layer: 'hq_bnd',
      minzoom: 6,
      maxzoom: 8
    }
    return f
  },
  unhq_bnda_a2: f => {
    f.tippecanoe = {
      layer: 'hq_bnd',
      minzoom: 9,
      maxzoom: 15
    }
    return f
  },
 unhq_bnda_a1_p: f => {
    f.tippecanoe = {
      layer: 'hq_bnd_lab1',
      minzoom: 6,
      maxzoom: 8
    }
    return f
  },
  unhq_bnda_a2_p: f => {
    f.tippecanoe = {
      layer: 'hq_bnd_lab2',
      minzoom: 9,
      maxzoom: 15
    }
    return f
  },
  custom_unmap_0_bnda_a1: f => {
    f.tippecanoe = {
      layer: 'c_bnd',
      minzoom: 6,
      maxzoom: 8
    }
    return f
  },
  custom_unmap_0_bnda_a2: f => {
    f.tippecanoe = {
      layer: 'c_bnd',
      minzoom: 9,
      maxzoom: 15
    }
    return f
  },
  custom_unmap_0_bnda_a1_p: f => {
    f.tippecanoe = {
      layer: 'c_bnd_lab1',
      minzoom: 6,
      maxzoom: 8
    }
    return f
  },
  custom_unmap_0_bnda_a2_p: f => {
    f.tippecanoe = {
      layer: 'c_bnd_lab2',
      minzoom: 9,
      maxzoom: 15
    }
    return f
  },
  custom_unmap_0_bndl: f => {
    f.tippecanoe = {
      layer: 'c_bnd',
      minzoom: 5,
      maxzoom: 15
    }
    return f
  },
  un_unmik_bnda_a2: f => {
    f.tippecanoe = {
      layer: 'mik_bnd',
      minzoom: 7,
      maxzoom: 8
    }
    return f
  },
  un_unmik_bnda_a_p: f => {
    f.tippecanoe = {
      layer: 'mik_bnd_lab2',
      minzoom: 7,
      maxzoom: 8
    }
    return f
  },
  un_unmik_bnda_a3: f => {
    f.tippecanoe = {
      layer: 'mik_bnd',
      minzoom: 9,
      maxzoom: 15
    }
    return f
  },
  un_unmik_bnda_a3_p: f => {
    f.tippecanoe = {
      layer: 'mik_bnd_lab3',
      minzoom: 8,
      maxzoom: 15
    }
    return f
  },
  un_unmik_bndl: f => {
    f.tippecanoe = {
      layer: 'mik_bnd',
      minzoom: 7,
      maxzoom: 15
    }
    return f
  },
  un_unvmc_igac_bnda_a1_departments: f => {
    f.tippecanoe = {
      layer: 'vmc_bnd',
      minzoom: 7,
      maxzoom: 8
    }
    return f
  },
  un_unvmc_igac_bnda_a1_departments_p: f => {
    f.tippecanoe = {
      layer: 'vmc_bnd_lab1',
      minzoom: 7,
      maxzoom: 8
    }
    return f
  },
  un_unvmc_igac_bnda_a2_municipalities: f => {
    f.tippecanoe = {
      layer: 'vmc_bnd',
      minzoom: 9,
      maxzoom: 10
    }
    return f
  },
  un_unvmc_igac_bnda_a2_municipalities_p: f => {
    f.tippecanoe = {
      layer: 'vmc_bnd_lab2',
      minzoom: 9,
      maxzoom: 10
    }
    return f
  },
  un_unvmc_igac_bnda_a3_rural_units: f => {
    f.tippecanoe = {
      layer: 'vmc_bnd',
      minzoom: 11,
      maxzoom: 15
    }
    return f
  },
  un_unvmc_igac_bnda_a3_rural_units_p: f => {
    f.tippecanoe = {
      layer: 'vmc_bnd_lab3',
      minzoom: 11,
      maxzoom: 15
    }
    return f
  },
  un_unvmc_igac_bndl: f => {
    f.tippecanoe = {
      layer: 'vmc_bnd',
      minzoom: 6,
      maxzoom: 15
    }
    return f
  },
  unhq_bnda05_cty: f => {
    f.tippecanoe = {
      layer: 'bnd_cty',
      minzoom: 5,
      maxzoom: 11
    }
    return f
  },
  unhq_bnda_cty_anno_l06: f => {
    f.tippecanoe = {
      layer: 'lab_cty',
      minzoom: 5,
      maxzoom: 11
    }
    return f
  },



// 4. road
  roads_major_l: f => {
    f.tippecanoe = {
      layer: 'road',
      minzoom: minzoomRoad(f),
      maxzoom: 15
    }
    delete f.properties['class']
    delete f.properties['ungsc_ctry']
    if (f.properties.ungsc_mission === 'UNMIK') {
      f.properties.name = ''
    }
    delete f.properties['ungsc_mission']
    return f
  },
  roads_medium_l: f => {
    f.tippecanoe = {
      layer: 'road',
      minzoom: minzoomRoad(f),
      maxzoom: 15
    }
    delete f.properties['class']
    delete f.properties['ungsc_ctry']
    if (f.properties.ungsc_mission === 'UNMIK') {
      f.properties.name = ''
    }
    delete f.properties['ungsc_mission']
    return f
  },
  roads_minor_l: f => {
    f.tippecanoe = {
      layer: 'road',
      minzoom: minzoomRoad(f),
      maxzoom: 15
    }
    delete f.properties['class']
    delete f.properties['ungsc_ctry']
    if (f.properties.ungsc_mission === 'UNMIK') {
      f.properties.name = ''
    }
    delete f.properties['ungsc_mission']
    return f
  },
  roads_other_l: f => {
    f.tippecanoe = {
      layer: 'road',
      minzoom: minzoomRoad(f),
      maxzoom: 15
    }
    delete f.properties['class']
    delete f.properties['ungsc_ctry']
    if (f.properties.ungsc_mission === 'UNMIK') {
      f.properties.name = ''
    }
    delete f.properties['ungsc_mission']
    return f
  },
  roads_special_l: f => {
    f.tippecanoe = {
      layer: 'road',
      minzoom: minzoomRoad(f),
      maxzoom: 15
    }
    delete f.properties['class']
    delete f.properties['ungsc_ctry']
    if (f.properties.ungsc_mission === 'UNMIK') {
      f.properties.name = ''
    }
    delete f.properties['ungsc_mission']
    return f
  },
  // 5. railway
  railways_all_l: f => {
    f.tippecanoe = {
      layer: 'railway',
      minzoom: 9,
      maxzoom: 15
    }
    delete f.properties['traction']
    delete f.properties['ungsc_ctry']
    delete f.properties['ungsc_ctry_name']
    delete f.properties['ungsc_mission']
    return f
  },
  // 6. route
  ferries_all_l: f => {
    f.tippecanoe = {
      layer: 'ferry',
      minzoom: 6,
      maxzoom: 15
    }
    delete f.properties['class']
    delete f.properties['ungsc_ctry']
    delete f.properties['ungsc_mission']
    return f
  },
  // 7. structure
  runways_all_l: f => {
    f.tippecanoe = {
      layer: 'runway',
      minzoom: 11,
      maxzoom: 15
    }
    delete f.properties['class']
    delete f.properties['ungsc_ctry']
    delete f.properties['ungsc_mission']
    return f
  },
  roads_all_a: f => {
    f.tippecanoe = {
      layer: 'highway_area',
      minzoom: flap(f, 10),
      maxzoom: 15
    }
    delete f.properties['class']
    delete f.properties['ungsc_ctry']
    if (f.properties.ungsc_mission === 'UNMIK') {
      f.properties.name = ''
    }
    delete f.properties['ungsc_mission']
    return f
  },
  pois_transport_a: f => {
    f.tippecanoe = {
      layer: 'trans_area',
      minzoom: flap(f, 10),
      maxzoom: 15
    }
    delete f.properties['class']
    delete f.properties['ungsc_ctry']
    delete f.properties['ungsc_mission']
    return f
  },
  // 8. building
  landuse_urban_a: f => {
    f.tippecanoe = {
      layer: 'lu_urban',
      minzoom: 10,
      maxzoom: 15
    }
    delete f.properties['class']
    delete f.properties['ungsc_ctry']
    delete f.properties['ungsc_mission']
    return f
  },
  buildings_a: f => {
    f.tippecanoe = {
      layer: 'building',
      minzoom: 12,
      maxzoom: 15
    }
    delete f.properties['class']
    delete f.properties['z_order']
    delete f.properties['ungsc_ctry']
    delete f.properties['ungsc_mission']
    return f
  },
  osm_planet_other_buildings: f => {
    f.tippecanoe = {
      layer: 'building_o',
      minzoom: 12,
      maxzoom: 15
    }
    delete f.properties['class']
    delete f.properties['z_order']
    delete f.properties['tags']
    delete f.properties['ungsc_ctry']
    delete f.properties['ungsc_mission']
    delete f.properties['shop']
    delete f.properties['craft']
    delete f.properties['sport']
    delete f.properties['emergency']
    delete f.properties['operator']
    delete f.properties['healthcare']
    delete f.properties['highway']
    delete f.properties['historic']
    delete f.properties['leisure']
    delete f.properties['man_made']
    delete f.properties['military']
    delete f.properties['disused']
    delete f.properties['office']
    delete f.properties['power']
    delete f.properties['public_transport']
    delete f.properties['railway']
    delete f.properties['seamark_landmark_category']
    delete f.properties['seamark_type']
    delete f.properties['tourism']
    delete f.properties['type']
    return f
  },
  // 9. pois place
  // 9. place
  unhq_popp: f => {
    f.tippecanoe = {
      layer: 'un_popp',
      minzoom: 5,
      maxzoom: 15
    }
    return f
  },
  un_global_places: f => {
    f.tippecanoe = {
      layer: 'un_place',
      minzoom: 6,
      maxzoom: 15
    }
    f.properties._source = 'un_global_places'
    return f
  },
  unhq_cm02_phyp_anno_l06: f => {
    f.tippecanoe = {
      layer: 'lab_water_m',
      minzoom: 5,
      maxzoom: 10
    }
    return f
  },
  unhq_phyp: f => {
    f.tippecanoe = {
      layer: 'label',
      minzoom: 5,
      maxzoom: 15
    }
//edit 2021-01-27 starts
f.properties.display = 0
if (f.properties.type_code == 4 && !/Sea|Ocean|Gulf/.test(f.properties.name) ){
f.properties.display = 1
}
//edit 2021-01-27 ends

    return f
  },
  un_minusca_pois: f => {
    f.tippecanoe = {
      layer: 'poi_minusca',
      maxzoom: 15
    }
    switch (f.properties.feat_class) {
      //Large airport
      case 'Airport':
         f.tippecanoe.minzoom = 7
        break
      //public
      case 'NGO':
      case 'Police':
      case 'Embassy':
      case 'Consulate':
      case 'Local Authority':
      case 'International Organisation':
      case 'Public Place':
      case 'National Institution':
      case 'Regional Organisation':
      case 'Library':
      case 'Youth Centre':
      case 'Social Centre':
      case 'Military Camp':
         f.tippecanoe.minzoom = 11
        break
      //transport1
      case 'Boat Ramp':
         f.tippecanoe.minzoom = 12
        break
      //service1
      case 'Hospital':
      case 'Health Centre':
      case 'University & College':
      case 'Kindergarten':
      case 'Primary School':
      case 'Secondary School':
      case 'Hotel':
         f.tippecanoe.minzoom = 13
        break
      //worship
      case 'Church':
      case 'Mosque':
         f.tippecanoe.minzoom = 13
        break
      //traffic
      case 'Fuel Station':
         f.tippecanoe.minzoom = 14
        break
/*
      //service2
      case 'Club':
      case 'Restaurant':
         f.tippecanoe.minzoom = 15
        break
      //heritage
      case 'Cemetery':
      case 'Landmark':
         f.tippecanoe.minzoom = 15
        break
      //other
      case 'Market':
      case 'Super Market':	
      case 'Bank':
      case 'RadioTower':
      case 'Telecommunication':
      case 'Stadium':
      case 'Zoo':
         f.tippecanoe.minzoom = 15
        break
*/
     default:
        f.tippecanoe.minzoom = 15
    }
    return f
  },
  un_global_pois: f => {
    f.tippecanoe = {
      layer: 'un_poi',
      maxzoom: 15
    }
    switch (f.properties.type) {
      //Large airport
      case 'Airport':
         f.tippecanoe.minzoom = 7
        break
      //transport1(big)
      case 'Airfield':
      case 'Helipad':
         f.tippecanoe.minzoom = 10
        break
      //public
      case 'NGO':
      case 'UN':
      case 'Post Office':
      case 'Fire Station':
      case 'Prison':
      case 'Police Station':
      case 'Courthouse':
      case 'Embassy':
      case 'Town Hall':
      case 'Other Public Building':
      case 'Military':
         f.tippecanoe.minzoom = 11
        break
      //transport1(small)
      case 'Taxi Station':
      case 'Ferry Terminal':
      case 'Port':
      case 'Bus Station':
      case 'Railway Station':
         f.tippecanoe.minzoom = 12
        break
      //service1
      case 'Hospital':
      case 'University':
      case 'College':
      case 'School':
      case 'Hotel':
         f.tippecanoe.minzoom = 13
        break
      //worship
      case 'Christian':
      case 'Muslim':
         f.tippecanoe.minzoom = 13
        break
      //traffic
      case 'Fuel':
         f.tippecanoe.minzoom = 14
        break
     default:
        f.tippecanoe.minzoom = 15
    }
    return f
  },
  pois_transport_p: f => {
    f.tippecanoe = {
    layer: 'poi_trans',
    maxzoom: 15
    }
    switch (f.properties.fclass) {
      case 'aerodrome':
         f.tippecanoe.minzoom = 7
        break
      case 'airfield':
         f.tippecanoe.minzoom = 10
        break
      case 'helipad':
         f.tippecanoe.minzoom = 10
        break
      case 'station':
         f.tippecanoe.minzoom = 12
        break
      case 'bus_station':
         f.tippecanoe.minzoom = 12
        break
      case 'ferry_terminal':
         f.tippecanoe.minzoom = 12
        break
     default:
        f.tippecanoe.minzoom = 15
    }
  delete f.properties['class']
  if (f.properties.ungsc_mission === 'UNMIK' || f.properties.status === 'f') {
    delete f
  }
  return f
  },
  pois_transport_ap: f => {
    f.tippecanoe = {
      layer: 'poi_trans',
      maxzoom: 15
    }
    switch (f.properties.fclass) {
      case 'aerodrome':
         f.tippecanoe.minzoom = 7
        break
      case 'airfield':
         f.tippecanoe.minzoom = 10
        break
      case 'helipad':
         f.tippecanoe.minzoom = 10
        break
      case 'station':
         f.tippecanoe.minzoom = 12
        break
      case 'bus_station':
         f.tippecanoe.minzoom = 12
        break
      case 'ferry_terminal':
         f.tippecanoe.minzoom = 12
        break
     default:
        f.tippecanoe.minzoom = 15
    }
    f.properties._source = 't-ap'
    delete f.properties['class']
  if (f.properties.ungsc_mission === 'UNMIK' || f.properties.status === 'f') {
    delete f
  }
    return f 
},
  pois_public_p: f => {
    f.tippecanoe = {
    layer: 'poi_public',
    minzoom: 12,
    maxzoom: 15
    }
  delete f.properties['class']
  return f
  },
  pois_public_ap: f => {
    f.tippecanoe = {
      layer: 'poi_public',
      minzoom: 12,
      maxzoom: 15
    }
  f.properties._source = 'pu-ap'
  delete f.properties['class']
  if (f.properties.ungsc_mission === 'UNMIK' || f.properties.status === 'f') {
    delete f
  }
  return f 
},
  pois_services_p: f => {
    f.tippecanoe = {
    layer: 'poi_services',
    maxzoom: 15
    }
    switch (f.properties.fclass) {
      case 'college':
      case 'doctors':
      case 'hospital':
      case 'hotel':
      case 'kindergarten':
      case 'school':
      case 'university':
         f.tippecanoe.minzoom = 13
        break
     default:
        f.tippecanoe.minzoom = 14
    }
  delete f.properties['class']
  if (f.properties.ungsc_mission === 'UNMIK' || f.properties.status === 'f') {
    delete f
  }
  return f
  },
  pois_services_ap: f => {
    f.tippecanoe = {
      layer: 'poi_services',
      maxzoom: 15
    }
    switch (f.properties.fclass) {
      case 'college':
      case 'doctors':
      case 'hospital':
      case 'hotel':
      case 'kindergarten':
      case 'school':
      case 'university':
         f.tippecanoe.minzoom = 13
        break
     default:
        f.tippecanoe.minzoom = 14
    }
  f.properties._source = 'se-ap'
  delete f.properties['class']
  if (f.properties.ungsc_mission === 'UNMIK' || f.properties.status === 'f') {
    delete f
  }
  return f 
},
  pois_worship_p: f => {
    f.tippecanoe = {
    layer: 'poi_worship',
    minzoom: 13,
    maxzoom: 15
    }
  delete f.properties['class']
  if (f.properties.ungsc_mission === 'UNMIK' || f.properties.status === 'f') {
    delete f
  }
  return f
  },
  pois_worship_ap: f => {
    f.tippecanoe = {
      layer: 'poi_worship',
      minzoom: 13,
      maxzoom: 15
    }
   delete f.properties['class']
  if (f.properties.ungsc_mission === 'UNMIK' || f.properties.status === 'f') {
    delete f
  }
    return f
 },
  pois_heritage_p : f => {
    f.tippecanoe = {
    layer: 'poi_heritage',
    minzoom: 15,
    maxzoom: 15
    }
    delete f.properties['class']
  if (f.properties.ungsc_mission === 'UNMIK' || f.properties.status === 'f') {
    delete f
  }
  return f
  },
  pois_heritage_ap: f => {
    f.tippecanoe = {
      layer: 'poi_heritage',
      minzoom: 15,
      maxzoom: 15
    }
    delete f.properties['class']
  if (f.properties.ungsc_mission === 'UNMIK' || f.properties.status === 'f') {
    delete f
  }
    return f 
},
  pois_other_p: f => {
    if (f.properties.fclass == 'station'){
        f.properties.fclass = 'p_station'
    }
    f.tippecanoe = {
    layer: 'poi_other',
    minzoom: 15,
    maxzoom: 15
    }
    delete f.properties['class']
  if (f.properties.ungsc_mission === 'UNMIK' || f.properties.status === 'f') {
    delete f
  }
  return f
  },
  pois_other_ap: f => {
    f.tippecanoe = {
      layer: 'poi_other',
      minzoom: 15,
      maxzoom: 15
    }
  delete f.properties['class']
  if (f.properties.ungsc_mission === 'UNMIK' || f.properties.status === 'f') {
    delete f
  }
    return f 
},
  pois_traffic_p: f => {
    f.tippecanoe = {
    layer: 'poi_traffic',
    minzoom: 14,
    maxzoom: 15
    }
  delete f.properties['class']
  if (f.properties.ungsc_mission === 'UNMIK' || f.properties.status === 'f') {
    delete f
  }
  return f
  },
  pois_water_p: f => {
    f.tippecanoe = {
    layer: 'poi_water',
    minzoom: 15,
    maxzoom: 15
    }
  delete f.properties['class']
  if (f.properties.ungsc_mission === 'UNMIK' || f.properties.status === 'f') {
    delete f
  }
  return f
  },
  barriers_all_l: f => {
    f.tippecanoe = {
      layer: 'barrier',
      minzoom: 15,
      maxzoom: 15
    }
    delete f.properties['class']
    return f
 },
  landuse_parkreserve_a: f => {
    f.tippecanoe = {
      layer: 'area_park',
      minzoom: 7,
      maxzoom: 15
    }
    delete f.properties['class']
    return f 
},
  landuse_other_p: f => {
    f.tippecanoe = {
      layer: 'lu_pt',
      minzoom: 10,
      maxzoom: 15
    }
    return f 
},
  places_all_p: f => {
    f.tippecanoe = {
      layer: 'osm_place',
      minzoom: 7,
      maxzoom: 15
    }
    return f 
},
  places_all_a: f => {
    f.tippecanoe = {
      layer: 'place_a',
      minzoom: 10,
      maxzoom: 15
    }
    return f 
  },
  pois_services_a: f => {
    f.tippecanoe = {
      layer: 'service_a',
      minzoom: 13,
      maxzoom: 15
    }
  if (f.properties.ungsc_mission === 'UNMIK' || f.properties.status === 'f') {
    delete f
  }
    return f
  }
}
module.exports = (f) => {
  return postProcess(lut[f.properties._table](preProcess(f)))
}

