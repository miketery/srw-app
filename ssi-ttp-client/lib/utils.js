// format unix timestamp to date MM/DD/YYYY
export const formatDate = (timestamp) => {
  const date = new Date(timestamp*1000);
  return date.toLocaleDateString();
}

export const myGoBack = (navigation) => {
  // console.log(navigation.getState().routes)
  const state_routes = navigation.getState().routes;
  if(state_routes.length < 2) return;
  const second_to_last_state = state_routes[state_routes.length - 2];
  navigation.navigate({key: second_to_last_state.key, params: second_to_last_state.params});
}
