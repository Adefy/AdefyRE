/*
 * Wrapper script for EWGL_math.js
 */

Vector3 = window.v3
Matrix4 = window.m4x4

Matrix4.prototype.flatten = function() {
  return this.elements;
}