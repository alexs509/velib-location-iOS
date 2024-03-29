import React from 'react';
import { StyleSheet, Text, View, Button, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default class Location extends React.Component {
  constructor(props) {
    super(props);
    this.state = { location: null, all: null };

    navigator.geolocation.getCurrentPosition(
      position => {
        const location = position;
        this.setState({ location });
        return fetch('https://opendata.paris.fr/api/records/1.0/search/?dataset=velib-disponibilite-en-temps-reel&rows=19&facet=overflowactivation&facet=creditcard&facet=kioskstate&facet=station_state&geofilter.distance=+' + this.state.location.coords.latitude + '%2C' + this.state.location.coords.longitude + '%2C15000')
          .then((response) => response.json())
          .then((responseJson) => {
            this.setState({
              all: responseJson.records,
            }, function () {
            });
          })
          .catch((error) => {
            console.error(error);
          });
      },
      error => Alert.alert(error.message),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  }

  render() {
    let coord = {
      latitude: null,
      longitude: null
    }
    if (this.state.location != null) {
      coord.latitude = this.state.location.coords.latitude;
      coord.longitude = this.state.location.coords.longitude;
    }

    return (
      <View style={styles.container}>
        { this.state.location &&
        <MapView showsUserLocation={true} style={styles.map}
          initialRegion={{
            latitude: coord.latitude,
            longitude: coord.longitude,
            latitudeDelta: 0.00922,
            longitudeDelta: 0.00421,
          }}>

          {this.state.all && this.state.all.map(marker => (
            <View key={marker.fields.station_name}>
              <Marker
                image={require('../assets/pin.png')}
                coordinate={{
                  latitude: marker.fields.geo[0],
                  longitude: marker.fields.geo[1]
                }}
                title={marker.fields.station_name}
                description={'Nombre de vélo dispo : ' + Number(marker.fields.nbebike+marker.fields.nbbike) + ' 🚴‍♂️'}
              />
            </View>
          ))}
        </MapView>
        }

        {!this.state.all &&
          <View>
            <ActivityIndicator size="large" color="#DAA520" />
            <Text style={{ fontWeight: 'bold', fontSize: 20 }}>
              Localisation en cours
        </Text>
          </View>
        }
      </View>
    );
  }
}


var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
    alignSelf: 'stretch',
    textAlign: 'center',
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  }
});