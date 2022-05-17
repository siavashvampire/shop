const express = require('express');
const formidable = require('formidable');
const multer = require("multer");
const path = require("path");
const router = express.Router();

const slug = require('slug');

// database module
const database = require('../config/database');
const RunQuery = database.RunQuery;

const Categories = require('../src/models/Categories.model');
const categories_model = new Categories();

const Products = require('../src/models/products.model');
const products_model = new Products();

const cat_storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Uploads is the Upload_folder_name
        cb(null, "public/img/categories")
        // cb(null, "uploads")
    }, filename: function (req, file, cb) {
        // cb(null, file.originalname  + "-" + Date.now()+".jpg")
        cb(null, file.originalname)
    }
});
const product_storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Uploads is the Upload_folder_name
        cb(null, "public/img/products")
        // cb(null, "uploads")
    }, filename: function (req, file, cb) {
        // cb(null, file.originalname  + "-" + Date.now()+".jpg")
        cb(null, file.originalname)
    }
});

const cat_maxSize = 2 * 1000 * 1000;
const product_maxSize = 2 * 1000 * 1000;

const cat_upload = multer({
    storage: cat_storage, limits: {fileSize: cat_maxSize}, fileFilter: function (req, file, cb) {

        // Set the filetypes, it is optional
        var filetypes = /jpeg|jpg|png/;
        var mimetype = filetypes.test(file.mimetype);

        var extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }

        cb("Error: File upload only supports the " + "following filetypes - " + filetypes);
    }

// mypic is the name of file attribute
}).single("image");
const product_upload = multer({
    storage: product_storage, limits: {fileSize: product_maxSize}, fileFilter: function (req, file, cb) {

        // Set the filetypes, it is optional
        var filetypes = /jpeg|jpg|png/;
        var mimetype = filetypes.test(file.mimetype);

        var extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }

        cb("Error: File upload only supports the " + "following filetypes - " + filetypes);
    }

// mypic is the name of file attribute
}).single("image");

function isAdmin(req, res, next) {
    return next();
    if (req.isAuthenticated()) {
        if (req.user.Admin == 1) {
            return next();
        } else {
            res.redirect('/usr/' + req.user.Username);
        }
    }

    res.redirect('/');
}

router.route('/')
    .get(isAdmin, function (req, res, next) {
        res.redirect('/admin/cat');
        /*var contextDict = {
         title: 'Admin',
         customer: req.user
         };
         res.render('admin/admin', contextDict);*/
    });

router.route('/cat')
    .get(isAdmin, function (req, res, next) {
        categories_model.getItems().then((items) => {
            const contextDict = {
                title: 'Admin - Categories',
                categories: items,
                customer: req.user
            };
            res.render('admin/categories', contextDict);
        });
    });

router.route('/cat/:id/edit')
    .get(isAdmin, function (req, res, next) {
        categories_model.getItems({
            CategoryID: req.params.id,
        }).then((items) => {
            const contextDict = {
                title: 'Admin - Edit Category',
                category: items[0],
                customer: req.user
            };
            res.render('admin/editCat', contextDict);
        });
    })

    .post(isAdmin, function (req, res, next) {
        cat_upload(req, res, function (err) {
            if (err) {
                // res.send(err)
                console.error(err)
            }
        })

        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            if (err) {
                console.error(err.message);
                return;
            }
            categories_model.updateItem(req.params.id, req.body.name, req.body.description, files.image.originalFilename)
                .then(() => {
                    res.redirect('/admin/cat')
                })
        });
    });

router.route('/cat/:id/delete')
    .post(isAdmin, function (req, res, next) {
        categories_model.deleteItem(req.params.id)
            .then(() => {
                res.redirect('/admin/cat');
            })
    });

router.route('/cat/add')
    .get(isAdmin, function (req, res, next) {
        var contextDict = {
            title: 'Admin - Add Category', customer: req.user
        };

        res.render('admin/addCat', contextDict);
    })

    .post(isAdmin, function (req, res, next) {
        cat_upload(req, res, function (err) {
            if (err) {
                res.send(err)
            }
        })

        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            if (err) {
                console.error(err.message);
                return;
            }

            categories_model.insertItem(req.body.name, req.body.description, files.image.originalFilename)
                .then(() => {
                    res.redirect('/admin/cat')
                })
        });

    });

router.route('/products/:filter?')
    .get(isAdmin, function (req, res, next) {
        let where = {}
        let CategoryID = 0

        if (req.params.filter) {
            where = {
                CategoryID: req.params.filter,
            }
            CategoryID = req.params.filter
        }
        products_model.getItems(where).then((items) => {
            categories_model.getItems().then((categories) => {
                const contextDict = {
                    title: 'Admin - Products',
                    products: items,
                    categoriesFilter: categories,
                    customer: req.user,
                    CategoryID: CategoryID
                };
                res.render('admin/products', contextDict);
            });
        });
    });

router.route('/products/:id/edit')
    .get(isAdmin, function (req, res, next) {
        products_model.getItems({
            ProductID: req.params.id,
        }).then((items) => {
            categories_model.getItems().then((categories) => {
                const contextDict = {
                    title: 'Admin - Edit Product',
                    product: items[0],
                    categories: categories,
                    customer: req.user
                };
                res.render('admin/editProduct', contextDict);
            });
        });
    })

    .post(isAdmin, function (req, res, next) {
        product_upload(req, res, function (err) {
            if (err) {
                res.send(err)
            }
        })

        const form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            if (err) {
                console.error(err.message);
                return;
            }
            products_model.updateItem(req.params.id, fields.name, fields.category, fields.price, fields.unit, fields.description, fields.year,
                fields.feature, files.image.originalFilename)
                .then(() => {
                    res.redirect('/admin/products')
                })
        });

    });

router.route('/products/:id/delete')
    .post(isAdmin, function (req, res, next) {
        products_model.deleteItem(req.params.id)
            .then(() => {
                res.redirect('/admin/products');
            })
    });

router.route('/products/add')
    .get(isAdmin, function (req, res, next) {
        categories_model.getItems().then((categories) => {
            const contextDict = {
                title: 'Admin - Add Product',
                categories: categories,
                customer: req.user
            };
            res.render('admin/addProduct', contextDict);
        });
    })

    .post(isAdmin, function (req, res, next) {
        product_upload(req, res, function (err) {
            if (err) {
                res.send(err)
            }
        })

        const form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            if (err) {
                console.error(err.message);
                return;
            }
            products_model.insertItem(fields.name, fields.category, fields.price, fields.unit, fields.description, fields.year,
                fields.feature, files.image.originalFilename)
                .then(() => {
                    res.redirect('/admin/products')
                })
        });
    });

router.route('/orders')
    .get(isAdmin, function (req, res) {

        var selectQuery = '\
            SELECT *\
            FROM Orders';

        RunQuery(selectQuery, function (orders) {

            var contextDict = {
                title: 'Admin - Orders', customer: req.user, orders: orders
            };

            res.render('admin/orders', contextDict);
        });
    });

router.route('/orders/:id')
    .get(isAdmin, function (req, res) {
        //get order info
        var selectQuery = '\
            SELECT *\
            FROM Orders\
            WHERE OrderID = ' + req.params.id;

        RunQuery(selectQuery, function (order) {
            //get user info
            selectQuery = '\
            SELECT *\
            FROM Users\
            WHERE UserID = ' + order[0].UserID;

            RunQuery(selectQuery, function (orderCustomer) {
                //get delivery info
                selectQuery = '\
                SELECT *\
                FROM Addresses\
                WHERE AddressID = ' + order[0].AddressID;

                RunQuery(selectQuery, function (address) {
                    //get order info
                    selectQuery = '\
                    SELECT *\
                    FROM `Order Details`\
                    INNER JOIN (\
                        SELECT Products.*, Categories.CategorySlug\
                        FROM Products\
                        INNER JOIN Categories\
                        ON Products.CategoryID = Categories.CategoryID\
                    ) `Table`\
                    ON `Order Details`.ProductID = `Table`.ProductID\
                    WHERE OrderID = ' + order[0].OrderID;

                    RunQuery(selectQuery, function (products) {
                        //get order info

                        var contextDict = {
                            title: 'Admin - Orders',
                            customer: req.user,
                            order: order[0],
                            orderCustomer: orderCustomer[0],
                            address: address[0],
                            products: products
                        };

                        res.render('admin/viewOrder', contextDict);
                    });
                });
            });
        });
    });

router.route('/orders/:id/update')
    .get(isAdmin, function (req, res, next) {

        var selectQuery = '\
            SELECT *\
            FROM Orders\
            WHERE OrderID = ' + req.params.id;

        RunQuery(selectQuery, function (order) {

            selectQuery = '\
                SELECT *\
                FROM Addresses\
                WHERE AddressID = ' + order[0].AddressID;

            RunQuery(selectQuery, function (address) {

                selectQuery = '\
                    SELECT *\
                    FROM `Order Details`\
                    INNER JOIN (\
                        SELECT Products.*, Categories.CategorySlug\
                        FROM Products\
                        INNER JOIN Categories\
                        ON Products.CategoryID = Categories.CategoryID\
                    ) `Table`\
                    ON `Order Details`.ProductID = `Table`.ProductID\
                    WHERE OrderID = ' + order[0].OrderID;

                RunQuery(selectQuery, function (products) {
                    var contextDict = {
                        title: 'Admin - Update Status Order ' + req.params.id,
                        customer: req.user,
                        order: order[0],
                        address: address[0],
                        products: products
                    };

                    res.render('admin/updateOrder', contextDict);

                });
            });
        });
    })

    .post(isAdmin, function (req, res, next) {
        var sqlStr = '\
        UPDATE Orders\
        SET Status = \'' + req.body.status + '\' \
        WHERE OrderID = ' + req.params.id;

        RunQuery(sqlStr, function (result) {
            res.redirect('/admin/orders');
        });
    });

router.route('/customers')
    .get(isAdmin, function (req, res) {

        var selectQuery = '\
            SELECT *\
            FROM Users';

        RunQuery(selectQuery, function (customers) {

            var contextDict = {
                title: 'Admin - Customers', customer: req.user, customers: customers
            };

            res.render('admin/customers', contextDict);
        });
    });

router.route('/customers/:id/makeAdmin')
    .post(isAdmin, function (req, res) {

        var updateQuery = '\
            UPDATE Users\
            SET Admin = 1\
            WHERE UserID = ' + req.params.id;

        RunQuery(updateQuery, function (result) {

            res.redirect('/admin/customers/');
        });
    });

router.route('/customers/:id/removeAdmin')
    .post(isAdmin, function (req, res) {

        var updateQuery = '\
            UPDATE Users\
            SET Admin = 0\
            WHERE UserID = ' + req.params.id;

        RunQuery(updateQuery, function (result) {

            res.redirect('/admin/customers/');
        });
    });

router.route('/customers/:id/delete')
    .post(isAdmin, function (req, res) {

        var deleteQuery = '\
            DELETE FROM Users\
            WHERE UserID = ' + req.params.id;

        RunQuery(deleteQuery, function (result) {

            res.redirect('/admin/customers/');
        });
    });

module.exports = router;