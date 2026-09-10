const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Replace the volunteer form with a Membership form
const newForm = `        <h3 style="margin-bottom:6px">Membership Registration</h3>
        <p style="color:var(--muted);font-size:.9rem;margin-bottom:22px">Become an official member. Your details help us coordinate community support.</p>
        <form id="memberForm" novalidate>
          <div class="row">
            <div class="field"><label for="mName">Full name</label><input id="mName" name="name" type="text" placeholder="e.g. Ahmad Jawid" autocomplete="name" required/><div class="err">Please enter your name.</div></div>
            <div class="field"><label for="mEmail">Email</label><input id="mEmail" name="email" type="email" placeholder="example@mail.com" autocomplete="email" required/><div class="err">Please enter a valid email.</div></div>
          </div>
          <div class="row">
            <div class="field"><label for="mPhone">Phone / WhatsApp</label><input id="mPhone" name="phone" type="tel" placeholder="07XX XXX XXX" autocomplete="tel" required/><div class="err">Please enter a valid phone number.</div></div>
            <div class="field"><label for="mPassword">Password</label><input id="mPassword" name="password" type="password" placeholder="Min 6 characters" required/><div class="err">Password must be at least 6 characters.</div></div>
          </div>
          <div class="row">
            <div class="field"><label for="mIdCard">ID Card Number (Tazkira/NID)</label><input id="mIdCard" name="idcard" type="text" placeholder="ID Number" required/><div class="err">ID Card number required.</div></div>
            <div class="field"><label for="mBlood">Blood Group</label>
              <select id="mBlood" name="bloodgroup" required>
                <option value="">Select...</option>
                <option value="A+">A+</option><option value="A-">A-</option>
                <option value="B+">B+</option><option value="B-">B-</option>
                <option value="AB+">AB+</option><option value="AB-">AB-</option>
                <option value="O+">O+</option><option value="O-">O-</option>
                <option value="Unknown">Unknown</option>
              </select>
            <div class="err">Blood group required.</div></div>
          </div>
          <div class="field"><label for="mPhoto">Profile Photo (Optional)</label><input id="mPhoto" name="photo" type="file" accept="image/*" /></div>
          <button type="submit" class="btn btn-primary" id="memberSubmitBtn" style="width:100%;justify-content:center">Register as Member →</button>
        </form>`;

html = html.replace(/<h3 style="margin-bottom:6px">Become a volunteer<\/h3>[\s\S]*?<\/form>/, newForm);

// Also update the local JS inside the script tag that references volForm
html = html.replace(/var vf=\$\('#volForm'\);[\s\S]*?toast\('Application received! Our coordinator will call you within 2 days.'\)\}\);/, '');

fs.writeFileSync('index.html', html);
