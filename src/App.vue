<template>
  <v-app>
    <v-container fluid class="p-0 m-0">
      <v-main>
        <router-view />
      </v-main>
    </v-container>
  </v-app>
</template>

<script>
export default {
  name: "App",
  data: () => ({
    //
  }),
  components: {},
};
</script>
