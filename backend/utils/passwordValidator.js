/**
 * Password validation utility
 */

// Minimum password requirements
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_REQUIRE_UPPERCASE = true;
const PASSWORD_REQUIRE_LOWERCASE = true;
const PASSWORD_REQUIRE_NUMBERS = true;
const PASSWORD_REQUIRE_SPECIAL = true;

/**
 * Validate password strength
 * @returns {Object} { valid: boolean, errors: string[] }
 */
function validatePassword(password) {
  const errors = [];

  if (!password) {
    errors.push('Password is required');
    return { valid: false, errors };
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`Password must be at least ${PASSWORD_MIN_LENGTH} characters long`);
  }

  if (PASSWORD_REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (PASSWORD_REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (PASSWORD_REQUIRE_NUMBERS && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (PASSWORD_REQUIRE_SPECIAL && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&* etc.)');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get password strength as percentage
 */
function getPasswordStrength(password) {
  let strength = 0;
  
  if (password.length >= PASSWORD_MIN_LENGTH) strength += 20;
  if (password.length >= 12) strength += 10;
  if (/[A-Z]/.test(password)) strength += 20;
  if (/[a-z]/.test(password)) strength += 20;
  if (/\d/.test(password)) strength += 15;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength += 15;
  
  return Math.min(strength, 100);
}

module.exports = {
  validatePassword,
  getPasswordStrength
};
