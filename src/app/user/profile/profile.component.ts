import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'; // Added Router
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

interface UserDetails {
  uid?: string;
  displayName?: string | null;
  email?: string | null;
  phoneNumber?: string | null; // Matches Firestore field
  location?: string | null;
  photoURL?: string | null;
  title?: string;
  firstName?: string;
  lastName?: string;
  phoneCode?: string;
  dob?: string;
  address?: string;
  town?: string;
  country?: string;
  zipCode?: string;
}

interface CountryCode {
  code: string;
  country: string;
  dialCode: string;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  activeTab: string = 'my-account';
  countryCodes: CountryCode[] = [
    { code: 'AF', country: 'Afghanistan', dialCode: '+93' },
    { code: 'al', country: 'Albania', dialCode: '+355' },
    { code: 'dz', country: 'Algeria', dialCode: '+213' },
    { code: 'ad', country: 'Andorra', dialCode: '+376' },
    { code: 'ao', country: 'Angola', dialCode: '+244' },
    { code: 'ag', country: 'Antigua and Barbuda', dialCode: '+1-268' },
    { code: 'ar', country: 'Argentina', dialCode: '+54' },
    { code: 'am', country: 'Armenia', dialCode: '+374' },
    { code: 'au', country: 'Australia', dialCode: '+61' },
    { code: 'at', country: 'Austria', dialCode: '+43' },
    { code: 'az', country: 'Azerbaijan', dialCode: '+994' },
    { code: 'bs', country: 'Bahamas', dialCode: '+1-242' },
    { code: 'bh', country: 'Bahrain', dialCode: '+973' },
    { code: 'bd', country: 'Bangladesh', dialCode: '+880' },
    { code: 'bb', country: 'Barbados', dialCode: '+1-246' },
    { code: 'by', country: 'Belarus', dialCode: '+375' },
    { code: 'be', country: 'Belgium', dialCode: '+32' },
    { code: 'bz', country: 'Belize', dialCode: '+501' },
    { code: 'bj', country: 'Benin', dialCode: '+229' },
    { code: 'bt', country: 'Bhutan', dialCode: '+975' },
    { code: 'bo', country: 'Bolivia', dialCode: '+591' },
    { code: 'ba', country: 'Bosnia and Herzegovina', dialCode: '+387' },
    { code: 'bw', country: 'Botswana', dialCode: '+267' },
    { code: 'br', country: 'Brazil', dialCode: '+55' },
    { code: 'bn', country: 'Brunei', dialCode: '+673' },
    { code: 'bg', country: 'Bulgaria', dialCode: '+359' },
    { code: 'bf', country: 'Burkina Faso', dialCode: '+226' },
    { code: 'bi', country: 'Burundi', dialCode: '+257' },
    { code: 'kh', country: 'Cambodia', dialCode: '+855' },
    { code: 'cm', country: 'Cameroon', dialCode: '+237' },
    { code: 'ca', country: 'Canada', dialCode: '+1' },
    { code: 'cv', country: 'Cape Verde', dialCode: '+238' },
    { code: 'cf', country: 'Central African Republic', dialCode: '+236' },
    { code: 'td', country: 'Chad', dialCode: '+235' },
    { code: 'cl', country: 'Chile', dialCode: '+56' },
    { code: 'cn', country: 'China', dialCode: '+86' },
    { code: 'co', country: 'Colombia', dialCode: '+57' },
    { code: 'km', country: 'Comoros', dialCode: '+269' },
    { code: 'cg', country: 'Congo', dialCode: '+242' },
    { code: 'cd', country: 'Congo, Democratic Republic', dialCode: '+243' },
    { code: 'cr', country: 'Costa Rica', dialCode: '+506' },
    { code: 'hr', country: 'Croatia', dialCode: '+385' },
    { code: 'cu', country: 'Cuba', dialCode: '+53' },
    { code: 'cy', country: 'Cyprus', dialCode: '+357' },
    { code: 'cz', country: 'Czech Republic', dialCode: '+420' },
    { code: 'dk', country: 'Denmark', dialCode: '+45' },
    { code: 'dj', country: 'Djibouti', dialCode: '+253' },
    { code: 'dm', country: 'Dominica', dialCode: '+1-767' },
    { code: 'do', country: 'Dominican Republic', dialCode: '+1-809' },
    { code: 'ec', country: 'Ecuador', dialCode: '+593' },
    { code: 'eg', country: 'Egypt', dialCode: '+20' },
    { code: 'sv', country: 'El Salvador', dialCode: '+503' },
    { code: 'gq', country: 'Equatorial Guinea', dialCode: '+240' },
    { code: 'er', country: 'Eritrea', dialCode: '+291' },
    { code: 'ee', country: 'Estonia', dialCode: '+372' },
    { code: 'et', country: 'Ethiopia', dialCode: '+251' },
    { code: 'fj', country: 'Fiji', dialCode: '+679' },
    { code: 'fi', country: 'Finland', dialCode: '+358' },
    { code: 'fr', country: 'France', dialCode: '+33' },
    { code: 'ga', country: 'Gabon', dialCode: '+241' },
    { code: 'gm', country: 'Gambia', dialCode: '+220' },
    { code: 'ge', country: 'Georgia', dialCode: '+995' },
    { code: 'de', country: 'Germany', dialCode: '+49' },
    { code: 'gh', country: 'Ghana', dialCode: '+233' },
    { code: 'gr', country: 'Greece', dialCode: '+30' },
    { code: 'gd', country: 'Grenada', dialCode: '+1-473' },
    { code: 'gt', country: 'Guatemala', dialCode: '+502' },
    { code: 'gn', country: 'Guinea', dialCode: '+224' },
    { code: 'gw', country: 'Guinea-Bissau', dialCode: '+245' },
    { code: 'gy', country: 'Guyana', dialCode: '+592' },
    { code: 'ht', country: 'Haiti', dialCode: '+509' },
    { code: 'hn', country: 'Honduras', dialCode: '+504' },
    { code: 'hu', country: 'Hungary', dialCode: '+36' },
    { code: 'is', country: 'Iceland', dialCode: '+354' },
    { code: 'in', country: 'India', dialCode: '+91' },
    { code: 'id', country: 'Indonesia', dialCode: '+62' },
    { code: 'ir', country: 'Iran', dialCode: '+98' },
    { code: 'iq', country: 'Iraq', dialCode: '+964' },
    { code: 'ie', country: 'Ireland', dialCode: '+353' },
    { code: 'il', country: 'Israel', dialCode: '+972' },
    { code: 'it', country: 'Italy', dialCode: '+39' },
    { code: 'jm', country: 'Jamaica', dialCode: '+1-876' },
    { code: 'jp', country: 'Japan', dialCode: '+81' },
    { code: 'jo', country: 'Jordan', dialCode: '+962' },
    { code: 'kz', country: 'Kazakhstan', dialCode: '+7' },
    { code: 'ke', country: 'Kenya', dialCode: '+254' },
    { code: 'ki', country: 'Kiribati', dialCode: '+686' },
    { code: 'kp', country: 'North Korea', dialCode: '+850' },
    { code: 'kr', country: 'South Korea', dialCode: '+82' },
    { code: 'kw', country: 'Kuwait', dialCode: '+965' },
    { code: 'kg', country: 'Kyrgyzstan', dialCode: '+996' },
    { code: 'la', country: 'Laos', dialCode: '+856' },
    { code: 'lv', country: 'Latvia', dialCode: '+371' },
    { code: 'lb', country: 'Lebanon', dialCode: '+961' },
    { code: 'ls', country: 'Lesotho', dialCode: '+266' },
    { code: 'lr', country: 'Liberia', dialCode: '+231' },
    { code: 'ly', country: 'Libya', dialCode: '+218' },
    { code: 'li', country: 'Liechtenstein', dialCode: '+423' },
    { code: 'lt', country: 'Lithuania', dialCode: '+370' },
    { code: 'lu', country: 'Luxembourg', dialCode: '+352' },
    { code: 'mg', country: 'Madagascar', dialCode: '+261' },
    { code: 'mw', country: 'Malawi', dialCode: '+265' },
    { code: 'my', country: 'Malaysia', dialCode: '+60' },
    { code: 'mv', country: 'Maldives', dialCode: '+960' },
    { code: 'ml', country: 'Mali', dialCode: '+223' },
    { code: 'mt', country: 'Malta', dialCode: '+356' },
    { code: 'mh', country: 'Marshall Islands', dialCode: '+692' },
    { code: 'mr', country: 'Mauritania', dialCode: '+222' },
    { code: 'mu', country: 'Mauritius', dialCode: '+230' },
    { code: 'mx', country: 'Mexico', dialCode: '+52' },
    { code: 'fm', country: 'Micronesia', dialCode: '+691' },
    { code: 'md', country: 'Moldova', dialCode: '+373' },
    { code: 'mc', country: 'Monaco', dialCode: '+377' },
    { code: 'mn', country: 'Mongolia', dialCode: '+976' },
    { code: 'me', country: 'Montenegro', dialCode: '+382' },
    { code: 'ma', country: 'Morocco', dialCode: '+212' },
    { code: 'mz', country: 'Mozambique', dialCode: '+258' },
    { code: 'mm', country: 'Myanmar', dialCode: '+95' },
    { code: 'na', country: 'Namibia', dialCode: '+264' },
    { code: 'nr', country: 'Nauru', dialCode: '+674' },
    { code: 'np', country: 'Nepal', dialCode: '+977' },
    { code: 'nl', country: 'Netherlands', dialCode: '+31' },
    { code: 'nz', country: 'New Zealand', dialCode: '+64' },
    { code: 'ni', country: 'Nicaragua', dialCode: '+505' },
    { code: 'ne', country: 'Niger', dialCode: '+227' },
    { code: 'ng', country: 'Nigeria', dialCode: '+234' },
    { code: 'nu', country: 'Niue', dialCode: '+683' },
    { code: 'no', country: 'Norway', dialCode: '+47' },
    { code: 'om', country: 'Oman', dialCode: '+968' },
    { code: 'pk', country: 'Pakistan', dialCode: '+92' },
    { code: 'pw', country: 'Palau', dialCode: '+680' },
    { code: 'pa', country: 'Panama', dialCode: '+507' },
    { code: 'pg', country: 'Papua New Guinea', dialCode: '+675' },
    { code: 'py', country: 'Paraguay', dialCode: '+595' },
    { code: 'pe', country: 'Peru', dialCode: '+51' },
    { code: 'ph', country: 'Philippines', dialCode: '+63' },
    { code: 'pl', country: 'Poland', dialCode: '+48' },
    { code: 'pt', country: 'Portugal', dialCode: '+351' },
    { code: 'qa', country: 'Qatar', dialCode: '+974' },
    { code: 'ro', country: 'Romania', dialCode: '+40' },
    { code: 'ru', country: 'Russia', dialCode: '+7' },
    { code: 'rw', country: 'Rwanda', dialCode: '+250' },
    { code: 'kn', country: 'Saint Kitts and Nevis', dialCode: '+1-869' },
    { code: 'lc', country: 'Saint Lucia', dialCode: '+1-758' },
    { code: 'vc', country: 'Saint Vincent and the Grenadines', dialCode: '+1-784' },
    { code: 'ws', country: 'Samoa', dialCode: '+685' },
    { code: 'sm', country: 'San Marino', dialCode: '+378' },
    { code: 'st', country: 'Sao Tome and Principe', dialCode: '+239' },
    { code: 'sa', country: 'Saudi Arabia', dialCode: '+966' },
    { code: 'sn', country: 'Senegal', dialCode: '+221' },
    { code: 'rs', country: 'Serbia', dialCode: '+381' },
    { code: 'sc', country: 'Seychelles', dialCode: '+248' },
    { code: 'sl', country: 'Sierra Leone', dialCode: '+232' },
    { code: 'sg', country: 'Singapore', dialCode: '+65' },
    { code: 'sk', country: 'Slovakia', dialCode: '+421' },
    { code: 'si', country: 'Slovenia', dialCode: '+386' },
    { code: 'sb', country: 'Solomon Islands', dialCode: '+677' },
    { code: 'so', country: 'Somalia', dialCode: '+252' },
    { code: 'za', country: 'South Africa', dialCode: '+27' },
    { code: 'ss', country: 'South Sudan', dialCode: '+211' },
    { code: 'es', country: 'Spain', dialCode: '+34' },
    { code: 'lk', country: 'Sri Lanka', dialCode: '+94' },
    { code: 'sd', country: 'Sudan', dialCode: '+249' },
    { code: 'sr', country: 'Suriname', dialCode: '+597' },
    { code: 'sz', country: 'Eswatini', dialCode: '+268' },
    { code: 'se', country: 'Sweden', dialCode: '+46' },
    { code: 'ch', country: 'Switzerland', dialCode: '+41' },
    { code: 'sy', country: 'Syria', dialCode: '+963' },
    { code: 'tj', country: 'Tajikistan', dialCode: '+992' },
    { code: 'tz', country: 'Tanzania', dialCode: '+255' },
    { code: 'th', country: 'Thailand', dialCode: '+66' },
    { code: 'tl', country: 'Timor-Leste', dialCode: '+670' },
    { code: 'tg', country: 'Togo', dialCode: '+228' },
    { code: 'to', country: 'Tonga', dialCode: '+676' },
    { code: 'tt', country: 'Trinidad and Tobago', dialCode: '+1-868' },
    { code: 'tn', country: 'Tunisia', dialCode: '+216' },
    { code: 'tr', country: 'Turkey', dialCode: '+90' },
    { code: 'tm', country: 'Turkmenistan', dialCode: '+993' },
    { code: 'tv', country: 'Tuvalu', dialCode: '+688' },
    { code: 'ug', country: 'Uganda', dialCode: '+256' },
    { code: 'ua', country: 'Ukraine', dialCode: '+380' },
    { code: 'ae', country: 'United Arab Emirates', dialCode: '+971' },
    { code: 'gb', country: 'United Kingdom', dialCode: '+44' },
    { code: 'us', country: 'United States', dialCode: '+1' },
    { code: 'uy', country: 'Uruguay', dialCode: '+598' },
    { code: 'uz', country: 'Uzbekistan', dialCode: '+998' },
    { code: 'vu', country: 'Vanuatu', dialCode: '+678' },
    { code: 've', country: 'Venezuela', dialCode: '+58' },
    { code: 'vn', country: 'Vietnam', dialCode: '+84' },
    { code: 'ye', country: 'Yemen', dialCode: '+967' },
    { code: 'zm', country: 'Zambia', dialCode: '+260' },
    { code: 'zw', country: 'Zimbabwe', dialCode: '+263' }
  ].sort((a, b) => a.country.localeCompare(b.country));

  filteredCountryCodes: CountryCode[] = [];
  searchQuery: string = '';
  userDetails: UserDetails | null = null;
  personalDetailsForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  isEditing: boolean = false; // Controls form editability

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private firestore: AngularFirestore,
    private route: ActivatedRoute,
    private router: Router // Added Router
  ) {
    this.personalDetailsForm = this.fb.group({
      title: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phoneCode: ['+91'],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{7,15}$')]],
      dob: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      confirmEmail: ['', [Validators.required, Validators.email]],
      address: [''],
      town: [''],
      country: [''],
      zipCode: ['', Validators.pattern('^[0-9]{5}(?:-[0-9]{4})?$|^[A-Z0-9]{3,10}$')]
    }, { validators: this.emailMatchValidator });
  }

  emailMatchValidator(form: FormGroup) {
    const email = form.get('email')?.value;
    const confirmEmail = form.get('confirmEmail')?.value;
    return email === confirmEmail ? null : { emailMismatch: true };
  }

  ngOnInit() {
    this.filteredCountryCodes = [...this.countryCodes];
    this.loadUserDetails();
    this.disableForm(); // Disable form by default
    this.route.queryParams.subscribe(params => {
      const tab = params['tab'];
      if (tab && ['my-account', 'my-bookings', 'change-password'].includes(tab)) {
        this.activeTab = tab;
      } else {
        this.activeTab = 'my-account';
        // Optionally update URL to default tab
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { tab: 'my-account' },
          queryParamsHandling: 'merge',
          replaceUrl: true
        });
      }
    });
  }

  onSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input) {
      this.searchQuery = input.value.toLowerCase();
      this.filteredCountryCodes = this.countryCodes.filter(c =>
        c.country.toLowerCase().includes(this.searchQuery) ||
        c.dialCode.toLowerCase().includes(this.searchQuery)
      );
    }
  }

  async loadUserDetails() {
    try {
      const user = await this.authService.getCurrentUser();
      if (user) {
        this.userDetails = {
          uid: user.uid,
          displayName: user.displayName || 'User',
          email: user.email || 'No email set',
          phoneNumber: 'Not set',
          photoURL: user.photoURL || null,
          location: 'Not set'
        };

        const userDocRef = this.firestore.collection('users').doc(user.uid);
        const userDoc = await userDocRef.get().toPromise();

        if (userDoc && userDoc.exists) {
          const data = userDoc.data() as UserDetails;
          this.userDetails = {
            uid: user.uid,
            displayName: `${data.firstName || ''} ${data.lastName || ''}`.trim() || user.displayName || 'User',
            email: data.email || user.email || 'No email set',
            phoneNumber: data.phoneNumber || 'Not set',
            phoneCode: data.phoneCode || '+91',
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            title: data.title || '',
            dob: data.dob || '',
            address: data.address || '',
            town: data.town || '',
            country: data.country || '',
            zipCode: data.zipCode || '',
            photoURL: data.photoURL || user.photoURL || null,
            location: data.location || 'Not set'
          };

          this.personalDetailsForm.patchValue({
            title: this.userDetails.title || '',
            firstName: this.userDetails.firstName || '',
            lastName: this.userDetails.lastName || '',
            phoneCode: this.userDetails.phoneCode || '+91',
            phone: this.userDetails.phoneNumber || '',
            dob: this.userDetails.dob || '',
            email: this.userDetails.email || '',
            confirmEmail: this.userDetails.email || '',
            address: this.userDetails.address || '',
            town: this.userDetails.town || '',
            country: this.userDetails.country || '',
            zipCode: this.userDetails.zipCode || ''
          });
        } else {
          let firstName = '';
          let lastName = '';
          if (user.displayName) {
            const nameParts = user.displayName.split(' ');
            firstName = nameParts[0] || '';
            lastName = nameParts.slice(1).join(' ') || '';
          }
          let phoneNumber = '';
          let phoneCode = '+91';
          if (user.phoneNumber) {
            const phoneMatch = user.phoneNumber.match(/(\+\d{1,3})(\d+)/);
            if (phoneMatch) {
              phoneCode = phoneMatch[1];
              phoneNumber = phoneMatch[2];
            } else {
              phoneNumber = user.phoneNumber;
            }
          }

          this.userDetails = {
            ...this.userDetails,
            firstName,
            lastName,
            phoneNumber,
            phoneCode
          };

          this.personalDetailsForm.patchValue({
            firstName: firstName || '',
            lastName: lastName || '',
            email: user.email || '',
            confirmEmail: user.email || '',
            phoneCode: phoneCode || '+91',
            phone: phoneNumber || ''
          });
        }

        console.log('User Details:', this.userDetails);
      }
    } catch (error) {
      console.error('Error loading user details:', error);
      this.errorMessage = 'Failed to load user details. Please try again.';
    }
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
    // Update URL with new tab query parameter
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: tab },
      queryParamsHandling: 'merge', // Preserve other query params if any
      replaceUrl: true // Avoid adding to browser history
    });
    if (tab !== 'my-account') {
      this.isEditing = false; // Disable editing when switching tabs
      this.disableForm();
    }
  }

  startEditing() {
    this.isEditing = true;
    this.enableForm();
  }

  disableForm() {
    this.personalDetailsForm.disable();
  }

  enableForm() {
    this.personalDetailsForm.enable();
  }

  async onSubmit() {
    if (this.personalDetailsForm.valid && this.userDetails) {
      try {
        const formValue = this.personalDetailsForm.value;
        const displayName = `${formValue.firstName} ${formValue.lastName}`.trim();

        // Update Firebase Authentication profile
        await this.authService.updateUserProfile({
          displayName,
          email: formValue.email
        });

        // Update Firestore user document
        const userData: UserDetails = {
          title: formValue.title,
          firstName: formValue.firstName,
          lastName: formValue.lastName,
          phoneCode: formValue.phoneCode,
          phoneNumber: formValue.phone, // Save as phoneNumber
          dob: formValue.dob,
          email: formValue.email,
          address: formValue.address,
          town: formValue.town,
          country: formValue.country,
          zipCode: formValue.zipCode
        };

        await this.firestore.collection('users').doc(this.userDetails.uid).set(userData, { merge: true });

        // Update local user details
        this.userDetails = {
          ...this.userDetails,
          displayName,
          email: formValue.email,
          ...userData
        };

        this.successMessage = 'Profile updated successfully!';
        this.errorMessage = '';
        this.isEditing = false; // Disable editing after saving
        this.disableForm();
      } catch (error) {
        console.error('Error updating profile:', error);
        this.errorMessage = 'Failed to update profile. Please try again.';
        this.successMessage = '';
      }
    } else {
      this.errorMessage = 'Please fill all required fields correctly.';
      this.successMessage = '';
    }
  }
}