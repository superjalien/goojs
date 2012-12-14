define(["goo/math/Vector4"], function(Vector4) {
	"use strict";

	describe("Vector4", function() {
		it("can be accessed through indices", function() {
			var a = new Vector4(1, 2, 3, 4);

			expect(a[0]).toEqual(1);
			expect(a[1]).toEqual(2);
			expect(a[2]).toEqual(3);
			expect(a[3]).toEqual(4);
		});

		it("can be modified through indices", function() {
			var a = new Vector4();

			a[0] = 1;
			a[1] = 2;
			a[2] = 3;
			a[3] = 4;

			expect(a).toEqual(new Vector4(1, 2, 3, 4));
		});

		it("can be accessed through aliases", function() {
			var a = new Vector4(1, 2, 3, 4);

			expect(a.x).toEqual(1);
			expect(a.y).toEqual(2);
			expect(a.z).toEqual(3);
			expect(a.w).toEqual(4);
			expect(a.r).toEqual(1);
			expect(a.g).toEqual(2);
			expect(a.b).toEqual(3);
			expect(a.a).toEqual(4);
		});

		it("can be modified through aliases", function() {
			var a = new Vector4();

			a.x = 1;
			a.y = 2;
			a.z = 3;
			a.w = 4;

			expect(a).toEqual(new Vector4(1, 2, 3, 4));

			a.r = 2;
			a.g = 3;
			a.b = 4;
			a.a = 5;

			expect(a).toEqual(new Vector4(2, 3, 4, 5));
		});

		it("can perform addition", function() {
			var a = new Vector4(1, 2, 3, 4);
			var b = new Vector4(1, 2, 3, 4);

			a.add(a);

			expect(a).toEqual(new Vector4(2, 4, 6, 8));
			expect(Vector4.add(b, b)).toEqual(new Vector4(2, 4, 6, 8));

			expect(Vector4.add(b, 1)).toEqual(new Vector4(2, 3, 4, 5));
			expect(Vector4.add(1, b)).toEqual(new Vector4(2, 3, 4, 5));

			expect(Vector4.add(b, [1, 2, 3, 4])).toEqual(new Vector4(2, 4, 6, 8));
			expect(Vector4.add([1, 2, 3, 4], b)).toEqual(new Vector4(2, 4, 6, 8));

			expect(function() { Vector4.add(b, [1]); }).toThrow();
			expect(function() { Vector4.add([1], b); }).toThrow();
		});

		it("can perform subtraction", function() {
			var a = new Vector4(1, 2, 3, 4);
			var b = new Vector4(1, 2, 3, 4);

			a.sub(a);

			expect(a).toEqual(new Vector4(0, 0, 0, 0));
			expect(Vector4.sub(b, b)).toEqual(new Vector4(0, 0, 0, 0));

			expect(Vector4.sub(b, 1)).toEqual(new Vector4(0, 1, 2, 3));
			expect(Vector4.sub(1, b)).toEqual(new Vector4(0, -1, -2, -3));

			expect(Vector4.sub(b, [1, 2, 3, 4])).toEqual(new Vector4(0, 0, 0, 0));
			expect(Vector4.sub([1, 2, 3, 4], b)).toEqual(new Vector4(0, 0, 0, 0));

			expect(function() { Vector4.sub(b, [1]); }).toThrow();
			expect(function() { Vector4.sub([1], b); }).toThrow();
		});

		it("can perform multiplication", function() {
			var a = new Vector4(1, 2, 3, 4);
			var b = new Vector4(1, 2, 3, 4);

			a.mul(a);

			expect(a).toEqual(new Vector4(1, 4, 9, 16));
			expect(Vector4.mul(b, b)).toEqual(new Vector4(1, 4, 9, 16));

			expect(Vector4.mul(b, 1)).toEqual(new Vector4(1, 2, 3, 4));
			expect(Vector4.mul(1, b)).toEqual(new Vector4(1, 2, 3, 4));

			expect(Vector4.mul(b, [1, 2, 3, 4])).toEqual(new Vector4(1, 4, 9, 16));
			expect(Vector4.mul([1, 2, 3, 4], b)).toEqual(new Vector4(1, 4, 9, 16));

			expect(function() { Vector4.mul(b, [1]); }).toThrow();
			expect(function() { Vector4.mul([1], b); }).toThrow();
		});

		it("can perform division", function() {
			var a = new Vector4(1, 2, 3, 4);
			var b = new Vector4(1, 2, 3, 4);

			a.div(a);

			expect(a).toEqual(new Vector4(1, 1, 1, 1));
			expect(Vector4.div(b, b)).toEqual(new Vector4(1, 1, 1, 1));

			expect(Vector4.div(b, 1)).toEqual(new Vector4(1, 2, 3, 4));
			expect(Vector4.div(1, b)).toEqual(new Vector4(1, 1/2, 1/3, 1/4));

			expect(Vector4.div(b, [1, 2, 3, 4])).toEqual(new Vector4(1, 1, 1, 1));
			expect(Vector4.div([1, 2, 3, 4], b)).toEqual(new Vector4(1, 1, 1, 1));

			expect(function() { Vector4.div(b, [1]); }).toThrow();
			expect(function() { Vector4.div([1], b); }).toThrow();
		});

		it("can calculate dot products", function() {
			var a = new Vector4(1, 2);
			var b = new Vector4(1, 2);

			expect(a.dot(b)).toEqual(5);
			expect(Vector4.dot(a, b)).toEqual(5);
		});
	});
});
