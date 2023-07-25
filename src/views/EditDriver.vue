<script setup>
import { onMounted, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import UserServices from "../services/UserServices";

const route = useRoute();
const router = useRouter();

var user = ref({});
let isAddUser = ref(false);
let isEditUser = ref(true);
let readOnly = ref(true);

const snackbar = ref({
  value: false,
  color: "",
  text: "",
});

const rules = ref(({
      valid: false,
      nameRules: [
        value => {
          if (value) return true

          return 'Value is required.'
        },
        value => {
          if (value?.length <= 32) return true

          return 'Value must be less than 32 characters.'
        },
      ],
      emailRules: [
        value => {
          if (value) return true

          return 'E-mail is required.'
        },
        value => {
          if (/.+@.+\..+/.test(value)) return true

          return 'E-mail must be valid.'
        },
      ],
      phoneRules: [
        value => {
          if (value) return true

          return 'Phone Number is required.'
        },
        value => {
          if (/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im.test(value)) return true

          return 'Phone Number must be valid.'
        },
      ],
      passwordRules: [
        value => {
          if (value) return true

          return 'Password is required.'
        },
        value => {
          //At least 1 number, 1 Capital Letter, 1 Small letter, 1 Special Char
          if (/^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/.test(value)) return true

          return 'Password must be valid. (At least 1 number & 1 Capital Letter & 1 Small letter & 1 Special Character)'
        },
      ],
      confirmPasswordRules: [
        value => {
          if (value) return true

          return 'Value is required.'
        },
        value => {
          if (value === user.value.password) return true

          return 'Must match with Password.'
        },
      ],
      
    }));

onMounted(async () => {
  const cacheUser = localStorage.getItem("user");
  if(cacheUser === null){
    router.push({ name: "login" });
  }
  console.log(JSON.parse(cacheUser).id);
    
  await getUser();
  if (cacheUser !== null) {
    // user.value.id = JSON.parse(cacheUser).id;
    if(JSON.parse(cacheUser).role > 1){
        readOnly.value = false;
        console.log(readOnly);
    }
  }
});

async function getUser() {
  await UserServices.getUser(route.params.id)
    .then((response) => {
      user.value = response.data;
    })
    .catch((error) => {
      console.log(error);
    });
}

async function updateUser() {
  await UserServices.updateUser(user.value.id, user.value)
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `${user.value.firstName} updated successfully!`;
      setTimeout(()=> {router.push({ name: "home" });}, 5000);
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
  await getUser();
}

function closeSnackBar() {
  snackbar.value.value = false;
}

</script>

<template>
  <v-container>
    <v-btn v-if="user !== null" class="mx-2" @click="router.go(-1)"> Back </v-btn>
    <br><br>
    <v-row align="center">
      <v-col cols="10"
        ><v-card-title class="pl-0 text-h4 font-weight-bold"
          >{{ readOnly?"View ":"Edit " }} Driver
        </v-card-title>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-card class="rounded-lg elevation-5">
          <v-form v-model="rules.valid"
            :readonly="readOnly"
          >
          <v-card-text>
            <v-row>
              <v-col>
                <v-text-field
              v-model="user.firstName"
              label="First Name"
              :rules="rules.nameRules"
              required
            ></v-text-field>

            <v-text-field
              v-model="user.lastName"
              label="Last Name"
              :rules="rules.nameRules"
              required
            ></v-text-field>

            <v-text-field
              v-model="user.phoneNumber"
              label="Phone Number"
              :rules="rules.phoneRules"
              required
            ></v-text-field>

            <v-text-field
              v-model="user.email"
              label="Email"
              :rules="rules.emailRules"
              required
            ></v-text-field>

            <v-text-field
                v-model="user.password"
                label="Password"
                :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                :type="show1 ? 'text' : 'password'"
                :rules="rules.passwordRules"
                counter
                @click:append="show1 = !show1"
            ></v-text-field>
            <v-text-field
                v-model="user.confirm_password"
                label="Confirm Password"
                :rules="rules.confirmPasswordRules"
                :type="password"
            ></v-text-field>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions class="pt-0">
            
            <v-btn v-if="!readOnly"
            variant="flat" color="primary"
            @click="
              isAddUser
                ? addUser()
                : isEditUser
                ? updateUser()
                : false
            "
             >
             {{
              isAddUser
                ? "Create Driver"
                : isEditUser
                ? "Update Driver"
                : ""
            }}
            </v-btn>
            
            <v-spacer></v-spacer>
          </v-card-actions>
        </v-form>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar v-model="snackbar.value" rounded="pill">
      {{ snackbar.text }}

      <template v-slot:actions>
        <v-btn :color="snackbar.color" variant="text" @click="closeSnackBar()">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>
