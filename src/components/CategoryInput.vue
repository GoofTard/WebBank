<template>
  <v-card>
    <v-form v-model="valid">
      <v-container fluid class="p-4">
        <v-row>
          <v-col cols="3">
            <v-text-field
              v-model="category"
              :rules="rules.category"
              label="Category"
              required
              outlined
              clearable
            ></v-text-field>
          </v-col>

          <v-col cols="2">
            <v-text-field
              v-model="percentage"
              :rules="rules.percentage"
              label="Split"
              min="1"
              max="100"
              required
              outlined
              type="number"
              suffix="%"
            ></v-text-field>
          </v-col>

          <v-col cols="1">
            <v-checkbox v-model="limited" label="Limited"></v-checkbox>
          </v-col>

          <v-col cols="3">
            <v-text-field
              v-model="limit"
              :rules="rules.limit"
              label="Limit"
              type="number"
              outlined
              prefix="₪"
              :disabled="!limited"
            ></v-text-field>
          </v-col>

          <v-col cols="1">
            <v-checkbox v-model="locked" label="Locked"></v-checkbox>
          </v-col>
          <v-col cols="1" class="mt-4">
            <v-btn :color="isValidated" @click="addCategory"
              >Add Category</v-btn
            >
          </v-col>
        </v-row>
      </v-container>
    </v-form>
  </v-card>
</template>

<script>
export default {
  name: "CategoryInput",
  props: {
    item: {
      type: Object,
      required: false,
      default: undefined,
    },
    categories: {
      type: Array,
      required: true,
      default: [],
    },
  },
  data() {
    return {
      category: "",
      funds: 0,
      percentage: 1,
      limit: 1,
      limited: false,
      locked: false,
      rules: {
        category: [
          (value) => !!value || "Required!",
          (value) =>
            /[a-zA-Z0-9]/.test(value.trim()) || "Invalid Category Name!",
          (value) =>
            !this.categories.includes(value.trim()) ||
            this.item !== undefined ||
            "Category Already Exists!",
        ],
        percentage: [
          (value) => !!value || "Required!",
          (value) => value > 0 || "Percentage Must Be Atleast 1",
          (value) => value <= 100 || "Percentage Cannot Be Over 100",
        ],
        limit: [(value) => value > 0 || "Limit Must Be Atleast 1"],
      },
      valid: false,
    };
  },
  mounted() {
    if (this.item !== undefined) {
      this.category = this.item.category;
      this.funds = this.item.funds;
      this.percentage = this.item.split;
      this.limited = this.item.limit !== -1;
      this.limit = this.limited ? this.item.limit : 1;
      this.locked = this.item.locked;
    }
  },
  computed: {
    isValidated() {
      return this.valid ? "green" : "red";
    },
  },
  methods: {
    addCategory() {
      if (this.valid) {
        let item = {
          category: this.category.trim(),
          funds: this.funds,
          percentage: parseFloat(this.percentage),
          limit: this.limited ? parseFloat(this.limit) : -1,
          locked: this.locked,
        };

        this.$emit("add-item", {
          isUpdate: this.item === undefined ? false : true,
          item,
        });
      }
    },
  },
};
</script>

<style scoped></style>
