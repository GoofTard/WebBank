<template>
  <div>
    <v-data-table
      :headers="headers"
      :items="values"
      item-key="name"
      class="elevation-1"
    >
      <template v-slot:item.locked="{ item }">
        <v-icon :color="getIconColor(item.locked)">{{
          item.locked ? "mdi-check" : "mdi-close"
        }}</v-icon>
      </template>

      <template v-slot:item.limit="{ item }">
        <span :class="getLimitColor(item.limit, item.funds)">{{
          formatLimit(item.limit)
        }}</span>
      </template>

      <template v-slot:item.funds="{ item }">
        <span>{{ formatFunds(item.funds) }}</span>
      </template>

      <template v-slot:item.split="{ item }">
        <span>{{ formatSplit(item.split) }}</span>
      </template>

      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>My Funds</v-toolbar-title>
          <v-divider class="mx-4" inset vertical></v-divider>
          <v-spacer></v-spacer>
          <v-tooltip bottom :disabled="valid">
            <template v-slot:activator="{ on }">
              <div v-on="on" class="d-inline-block mb-2">
                <v-btn
                  class="me-4"
                  color="green"
                  @click="addFundsDialog = true"
                  :disabled="!valid"
                >
                  <v-icon>mdi-credit-card-plus</v-icon>
                </v-btn>

                <v-dialog
                  v-if="addFundsDialog"
                  v-model="addFundsDialog"
                  max-width="60%"
                >
                  <v-card>
                    <v-form v-model="validAdd">
                      <v-container fluid class="p-4">
                        <v-row>
                          <v-col cols="2">
                            <v-checkbox
                              v-model="splitBetween"
                              label="Split Between All Categories"
                            ></v-checkbox>
                          </v-col>
                          <v-col v-if="!splitBetween" cols="3" class="mt-4">
                            <v-autocomplete
                              v-model="category"
                              :items="categories"
                              :rules="rules.categories"
                              dense
                              outlined
                              label="Category"
                            ></v-autocomplete>
                          </v-col>
                          <v-col cols="3" class="mt-4">
                            <v-text-field
                              v-model="addingFunds"
                              :rules="rules.funds"
                              label="Funds"
                              type="number"
                              outlined
                              dense
                              prefix="₪"
                            ></v-text-field>
                          </v-col>
                          <v-col cols="1" class="mt-4">
                            <v-btn :color="isValidatedAdd" @click="addFunds"
                              >Add</v-btn
                            >
                          </v-col>
                        </v-row>
                      </v-container>
                    </v-form>
                  </v-card>
                </v-dialog>
              </div>
            </template>
            <span>
              The Total Percentage Of Your Categories Must Be 100! Current:
              {{ totalPercent }}%
            </span>
          </v-tooltip>
          <v-btn color="green" class="mb-2" @click="addCategoryDialog = true">
            <v-icon>mdi-tag-plus</v-icon>
          </v-btn>
          <v-dialog
            v-if="addCategoryDialog"
            v-model="addCategoryDialog"
            max-width="95%"
          >
            <CategoryInput
              :categories="categories"
              @add-item="AddItem"
            ></CategoryInput>
          </v-dialog>
          <v-dialog v-model="dialogDelete" max-width="50%">
            <v-card>
              <v-card-title class="text-h5 justify-center"
                >Are you sure you want to delete this category?</v-card-title
              >
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="closeDelete"
                  >Cancel</v-btn
                >
                <v-btn color="blue darken-1" text @click="deleteItemConfirm"
                  >Delete</v-btn
                >
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-dialog
            v-if="useFundsDialog"
            v-model="useFundsDialog"
            max-width="50%"
          >
            <v-card>
              <v-form v-model="validUse">
                <v-container fluid class="p-4">
                  <v-row class="justify-center">
                    <v-col cols="3" class="mt-4">
                      <v-text-field
                        v-model="usingFunds"
                        :rules="rules.funds"
                        label="Funds"
                        type="number"
                        outlined
                        dense
                        prefix="₪"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="1" class="mt-4">
                      <v-btn :color="isValidatedUse" @click="useFunds"
                        >Use</v-btn
                      >
                    </v-col>
                  </v-row>
                </v-container>
              </v-form>
            </v-card>
          </v-dialog>
          <v-dialog v-if="itemToEdit" v-model="itemToEdit" max-width="95%">
            <CategoryInput
              :categories="categories"
              :item="clickedItem"
              @add-item="AddItem"
            ></CategoryInput>
          </v-dialog>
        </v-toolbar>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-icon small class="mr-2" @click="editItem(item)"> mdi-pencil </v-icon>
        <v-icon small class="mr-2" @click="deleteItem(item)">
          mdi-delete
        </v-icon>
        <v-icon small @click="useFundsDialogFunc(item)">
          mdi-credit-card-minus</v-icon
        >
      </template>
      <template v-slot:footer>
        <v-toolbar flat>
          <div>Total Funds: ₪{{ userData.total }}</div>
        </v-toolbar>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import CategoryInput from "./CategoryInput.vue";
export default {
  name: "UserDataTable",
  components: { CategoryInput },
  props: {
    userData: {
      required: true,
      type: Object,
    },
  },
  data() {
    return {
      headers: [
        { text: "Category", value: "category" },
        { text: "Funds", value: "funds" },
        { text: "Split", value: "split" },
        { text: "Locked", value: "locked" },
        { text: "Limit", value: "limit" },
        { text: "Actions", value: "actions" },
      ],
      rules: {
        funds: [
          (value) => !!value || "Required!",
          (value) => value > 0 || "Funds Must Be Atleast 1",
        ],
        categories: [
          (value) => this.splitBetween || !!value || "Please Choose A Category",
        ],
      },
      usingFunds: 1,
      addCategoryDialog: false,
      dialogDelete: false,
      deleteCategory: undefined,
      itemToEdit: false,
      clickedItem: undefined,
      clickedItemCat: undefined,
      addFundsDialog: false,
      useFundsDialog: false,
      validUse: false,
      validAdd: false,
      splitBetween: true,
      addingCategory: undefined,
      addingFunds: 1,
    };
  },
  computed: {
    isValidatedUse() {
      return this.validUse ? "green" : "red";
    },
    isValidatedAdd() {
      return this.validAdd ? "green" : "red";
    },
    categories() {
      return this.userData.items.map((item) => item.category);
    },
    totalPercent() {
      let totalPercent = 0;
      this.userData.items.forEach((item) => (totalPercent += item.percentage));

      return totalPercent;
    },
    valid() {
      return this.totalPercent === 100;
    },
    values() {
      let values = [];
      let items = this.userData.items;
      items.forEach((item) =>
        values.push({
          category: item.category,
          funds: item.funds,
          split: item.percentage,
          locked: item.locked,
          limit: item.limit,
        })
      );

      return values;
    },
  },
  methods: {
    getIconColor(locked) {
      return locked ? "green" : "red";
    },
    getLimitColor(limit, funds) {
      return limit === -1
        ? "white--text"
        : funds >= limit
        ? "red--text"
        : "green--text";
    },
    formatLimit(limit) {
      return limit === -1 ? "-" : `₪${limit}`;
    },
    formatFunds(funds) {
      return `₪${funds}`;
    },
    formatSplit(split) {
      return `${split}%`;
    },
    indexOf(category) {
      let index = -1;
      let i = 0;

      this.userData.items.forEach((item) => {
        if (item.category === category) {
          index = i;
        }

        i += 1;
      });

      return index;
    },
    deleteItem(item) {
      this.dialogDelete = true;
      this.deleteCategory = item.category;
    },
    deleteItemConfirm() {
      let index = this.indexOf(this.deleteCategory);
      this.$emit("delete-category", index);
      this.closeDelete();
    },
    closeDelete() {
      this.deleteItem = undefined;
      this.dialogDelete = false;
    },
    AddItem(data) {
      if (data.isUpdate) {
        this.$emit("update-item", {
          new: data.item,
          old: this.clickedItemCat,
        });
      } else {
        this.$emit("add-item", data.item);
      }
      this.addCategoryDialog = false;
      this.itemToEdit = false;
    },
    editItem(item) {
      this.itemToEdit = true;
      this.clickedItem = item;
      this.clickedItemCat = item.category;
    },
    addFunds() {
      this.addFundsDialog = false;
      this.$emit("add-funds", {
        splitBetween: this.splitBetween,
        category: this.addingCategory,
        funds: parseFloat(this.addingFunds),
      });
    },
    useFundsDialogFunc(item) {
      this.useFundsDialog = true;
      this.clickedItemCat = item.category;
    },
    useFunds() {
      this.useFundsDialog = false;
      let index = this.indexOf(this.clickedItemCat);
      if (this.userData.items[index].locked) {
        return;
        //TODO add swal
      }

      this.$emit("use-funds", {
        funds: parseFloat(this.usingFunds),
        category: this.clickedItemCat,
      });
    },
  },
};
</script>

<style scoped></style>
