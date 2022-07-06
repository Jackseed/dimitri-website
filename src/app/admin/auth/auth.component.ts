// Angular
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

// Angularfire
import {
  Auth,
  indexedDBLocalPersistence,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
} from '@angular/fire/auth';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
})
export class AuthComponent implements OnInit {
  form!: FormGroup;

  type: 'login' | 'reset' = 'login';
  loading = false;

  serverMessage: string | undefined;

  constructor(
    private auth: Auth,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  changeType(type: 'login' | 'reset') {
    this.type = type;
  }

  get isLogin() {
    return this.type === 'login';
  }

  get isPasswordReset() {
    return this.type === 'reset';
  }

  get email() {
    return this.form?.get('email');
  }
  get password() {
    return this.form?.get('password');
  }

  async onSubmit() {
    this.loading = true;

    const email = this.email?.value;
    const password = this.password?.value;

    try {
      // Signs up & logs in.
      if (this.isLogin) {
        setPersistence(this.auth, indexedDBLocalPersistence);
        await signInWithEmailAndPassword(this.auth, email, password)
          .then((_) => this.router.navigate([`admin`]))
          .catch((error: any) => {
            this.serverMessage = error.message;
          });
      }
      // Resets password.
      if (this.isPasswordReset) {
        await sendPasswordResetEmail(this.auth, email);
        this.serverMessage = 'Check your email';
      }
    } catch (err: any) {
      this.serverMessage = err;
    }
    this.loading = false;
  }
}
