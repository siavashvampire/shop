const {DataTypes, Model} = require('sequelize');
const {sequelize} = require("../../config/database");
const Categories = require('./Categories.model');
const slug = require("slug");

class Products extends Model {
    ProductID;
    ProductName;
    insertDate;
    CategoryID;
    ProductPrice;
    UnitsInStock;
    Description;
    ManufactureYear;
    Image;
    ProductSlug;
    Feature;

    getItems(where = {},
             fields = ['ProductID', 'ProductName', 'ProductPrice','Description', 'ManufactureYear', 'Feature', 'UnitsInStock', 'Image'],
             order = [['CategoryID', 'ASC'],['insertDate', 'DESC']]) {
        return Products.findAll({
            attributes: fields,
            order:order,
            where:where,
            include: [{
                model: Categories,
                attributes: ['CategoryID','CategoryName'],
                required: true
            }],
        }).then((products) => {
            return products.map(function (product) {
                let temp = product.dataValues;
                temp["CategoryName"] = product.dataValues.Category.dataValues.CategoryName;
                temp["CategoryID"] = product.dataValues.Category.dataValues.CategoryID;
                return temp;
            });
        });
    }

    insertItem(ProductName, CategoryID, ProductPrice, UnitsInStock, Description, ManufactureYear,  Feature, Image='') {
        let values = {
            ProductName: ProductName,
            CategoryID: CategoryID,
            ProductPrice:ProductPrice,
            UnitsInStock:UnitsInStock,
            Description:Description,
            ManufactureYear:ManufactureYear,
            Feature:Feature,
            ProductSlug: slug(ProductName),
        }

        if (Image !== '')
            values["Image"] = Image;


        return Products.create(values);
    }

    updateItem(ProductID,ProductName, CategoryID, ProductPrice, UnitsInStock, Description, ManufactureYear,  Feature, Image='') {
        let values = {
            ProductName: ProductName,
            CategoryID: CategoryID,
            ProductPrice:ProductPrice,
            UnitsInStock:UnitsInStock,
            Description:Description,
            ManufactureYear:ManufactureYear,
            Feature:Feature,
            ProductSlug: slug(ProductName),
        }
        if (Image !== '')
            values["Image"] = Image;

        return Products.update(values, {
            where: {
                ProductID: ProductID
            }
        });
    }

    deleteItem(ProductID) {
        return Products.destroy({
                where: {
                    ProductID: ProductID
                }
            }
        )
    }
}

Products.init({
    ProductID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    ProductName: {
        type: DataTypes.STRING,
    },
    insertDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    CategoryID: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Categories',
            key: 'CategoryID'
        },
    },
    ProductPrice: {
        type: DataTypes.DECIMAL(10, 2),
    },
    UnitsInStock: {
        type: DataTypes.INTEGER,
    },
    Description: {
        type: DataTypes.STRING,
    },
    ManufactureYear: {
        type: DataTypes.INTEGER,
    },
    Image: {
        type: DataTypes.STRING,
    },
    ProductSlug: {
        type: DataTypes.STRING,
    },
    Feature: {
        type: DataTypes.INTEGER,
    },
}, {
    sequelize,
    timestamps: false
});

Products.hasOne(Categories, {foreignKey: 'CategoryID', sourceKey: 'CategoryID',constraints: false});
Categories.belongsTo(Products, {foreignKey: 'CategoryID',constraints: false});

module.exports = Products;