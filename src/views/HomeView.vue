<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <UserDataTableVue
          :user-data="user"
          @delete-category="deleteItem"
          @update-item="updateItem"
          @add-item="addItem"
          @use-funds="useFunds"
          @add-funds="addFunds"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axiosAPI from "../axios/axiosAPI.js";
import UserDataTableVue from "@/components/UserDataTable.vue";
export default {
  name: "Home",
  data() {
    return {
      user: {
        items: [],
        total: 0,
      },
      id: "TEST",
      addFundsDialog: false,
      useFundsDialog: false,
    };
  },
  async beforeMount() {
    this.user = await axiosAPI.getUser(this.id);
  },
  components: {
    UserDataTableVue,
  },
  computed: {
    categories() {
      return this.user.items.map((item) => item.category);
    },
  },
  methods: {
    async deleteItem(index) {
      let funds = this.user.items[index].funds;
      this.user.items.splice(index, 1);
      this.user.total -= funds;

      await axiosAPI.updateUser(this.user);
    },
    async updateItem(data) {
      let item = this.user.items.filter(
        (item) => item.category === data.old
      )[0];
      item.category = data.new.category;
      item.funds = data.new.funds;
      item.percentage = data.new.percentage;
      item.limit = data.new.limit;
      item.locked = data.new.locked;

      await axiosAPI.updateItems(this.id, this.user.items);
    },
    async addItem(item) {
      this.user.items.push(item);
      await axiosAPI.updateItems(this.id, this.user.items);
    },
    async addFunds(data) {
      this.addFundsDialog = false;
      let overflow = 0;
      let limitedCatAmount = 0;
      let items = this.user.items;
      this.user.total += data.funds;

      if (!data.splitBetween) {
        let item = this.user.items.filter(
          (item) => item.category === data.category
        )[0];

        item.funds += data.funds;
      } else {
        items.forEach((item) => {
          let categoryFunds = data.funds * (item.percentage / 100.0);
          if (item.limit !== -1 && item.funds >= item.limit) {
            overflow += categoryFunds;
            limitedCatAmount += 1;
          } else if (
            item.limit !== -1 &&
            item.funds + categoryFunds >= item.limit
          ) {
            let diff = item.limit - item.funds;
            overflow += categoryFunds - diff;
            limitedCatAmount += 1;
            item.funds = item.limit;
          } else {
            item.funds += categoryFunds;
          }
        });

        while (overflow > 0.01) {
          let percent = 100.0 / (items.length - limitedCatAmount) / 100.0;
          let tempOverflow = 0;
          let categoryFunds = overflow * percent;

          items.forEach((item) => {
            if (item.limit !== -1 && item.funds >= item.limit) {
              return;
            } else if (
              item.limit !== -1 &&
              item.funds + categoryFunds >= item.limit
            ) {
              let diff = item.limit - item.funds;
              tempOverflow += categoryFunds - diff;
              limitedCatAmount += 1;
              item.funds = item.limit;
            } else {
              item.funds += categoryFunds;
            }
          });

          overflow = tempOverflow;
        }
      }

      await axiosAPI.updateUser(this.user);
    },
    async useFunds(data) {
      let item = this.user.items.filter(
        (item) => item.category === data.category
      )[0];
      item.funds -= data.funds;
      this.user.total -= data.funds;

      await axiosAPI.updateUser(this.user);
    },
  },
};
</script>

<style scoped></style>
