<script setup>
import { onMounted } from "vue";
import { ref, toRaw } from "vue";
import { useRouter } from "vue-router";
import UserServices from "../services/UserServices.js";
import Login from "../services/login.js";

const router = useRouter();
const isCreateAccount = ref(false);
const snackbar = ref({
  value: false,
  color: "",
  text: "",
});
const user = ref({
  firstName: undefined,
  lastName: undefined,
  phoneNumber: undefined,
  email: undefined,
  password: undefined,
  confirm_password: undefined,
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
  if (localStorage.getItem("user") !== null) {
    router.push({ name: "home" });
  }
  Login.data();
});

function navigateToHome() {
  router.push({ name: "home" });
}

async function createAccount() {
  if(!rules.value.valid){
    snackbar.value.value = true;
    snackbar.value.color = "error";
    snackbar.value.text = "Please fix errors on the page to continue.";
    return;
  }
  await UserServices.addUser(user.value)
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = "Account created successfully!";
      setTimeout(()=> {router.push({ name: "login" });}, 5000);
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });    
}

async function login() {
  console.log(user.value);
  await UserServices.loginUser(user)
    .then((data) => {
      window.localStorage.setItem("user", JSON.stringify(data.data));
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = "Login successful!";
      router.push({ name: "home" });
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
}

function openCreateAccount() {
  isCreateAccount.value = true;
}

function closeCreateAccount() {
  isCreateAccount.value = false;
  router.push({ name: "login" });
}

function closeSnackBar() {
  snackbar.value.value = false;
}
</script>

<template>
  <v-container>
    <div id="body">
        <v-card class="rounded-lg elevation-5">
          <v-form v-model="rules.valid">
          <v-card-title class="headline mb-2">Sign Up</v-card-title>
          <v-card-text>
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
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              variant="flat"
              color="secondary"
              @click="closeCreateAccount()"
              >Go To Login</v-btn
            >
            <v-btn variant="flat" color="primary" @click="createAccount()"
              >Sign Up</v-btn
            >
          </v-card-actions>
        </v-form>
        </v-card>

      <v-snackbar v-model="snackbar.value" rounded="pill">
        {{ snackbar.text }}

        <template v-slot:actions>
          <v-btn
            :color="snackbar.color"
            variant="text"
            @click="closeSnackBar()"
          >
            Close
          </v-btn>
        </template>
      </v-snackbar>
    </div>
  </v-container>
</template>