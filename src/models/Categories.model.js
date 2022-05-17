const {DataTypes, Model} = require('sequelize');
const {sequelize} = require("../../config/database");
const slug = require('slug');

class Categories extends Model {
    CategoryID;
    CategoryName;
    insertDate;
    Description;
    CategorySlug;
    Image;

    getItems(where = {},
             fields = ['CategoryID', 'CategoryName', 'insertDate', 'Description', 'CategorySlug', 'Image'],
             order = [['insertDate', 'DESC']]) {

        return Categories.findAll({
            attributes: fields,
            order: order,
            where: where,
        }).then((categories) => {
            return categories.map(function (category) {
                return category.dataValues;
            });
        });
    }

    insertItem(CategoryName, Description, Image = '') {
        let values = {
            CategoryName: CategoryName,
            Description: Description,
            CategorySlug: slug(CategoryName),

        }
        if (Image !== '')
            values["Image"] = Image;


        return Categories.create(values);
    }

    updateItem(CategoryID, CategoryName, Description, Image = '') {
        let values = {
            CategoryName: CategoryName,
            Description: Description,
            CategorySlug: slug(CategoryName),

        }
        if (Image !== '')
            values["Image"] = Image;


        return Categories.update(values, {
            where: {
                CategoryID: CategoryID
            }
        });
    }

    deleteItem(CategoryID) {
        return Categories.destroy({
                where: {
                    CategoryID: CategoryID
                }
            }
        )
    }
}

Categories.init({
    CategoryID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    CategoryName: {
        type: DataTypes.STRING,
    },
    insertDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    Description: {
        type: DataTypes.STRING,
    },
    CategorySlug: {
        type: DataTypes.STRING,
    },
    Image: {
        type: DataTypes.STRING,
    },
}, {
    sequelize,
    timestamps: false
});

module.exports = Categories;