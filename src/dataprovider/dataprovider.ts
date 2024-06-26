import { DataProvider } from "@refinedev/core";
import {
    Firestore,
    getDocs,
    collection,
    addDoc,
    doc,
    getDoc,
    updateDoc,
    deleteDoc,
    where,
    query,
    orderBy,
    getFirestore,
} from "firebase/firestore";
import { db } from "../firebase/firebaseconfig";

class FirestoreDatabase {
    database: Firestore;
    constructor(options?: any, database?: Firestore) {
        this.database = database || getFirestore(options?.firebaseApp);
    }

    getCollectionRef(resource: string) {
        return collection(this.database, resource);
    }

    getDocRef(resource: string, id: string) {
        return doc(this.database, resource, id);
    }

    getFilterQuery({ resource, sort, filters }: any) {
        const ref = this.getCollectionRef(resource);
        let queryFilter = filters?.map((filter: any) => {
            const operator = getFilterOperator(filter.operator);
            return where(filter.field, operator, filter.value);
        });
        let querySorter = sort?.map((sorter: any) => orderBy(sorter.field, sorter.order));

        if (queryFilter?.length && querySorter?.length) {
            return query(ref, ...queryFilter, ...querySorter);
        } else if (queryFilter?.length) {
            return query(ref, ...queryFilter);
        } else if (querySorter?.length) {
            return query(ref, ...querySorter);
        } else {
            return ref;
        }
    }

    async createData<TVariables = {}>(args: any): Promise<any> {
        try {
            const ref = this.getCollectionRef(args.resource);
            const payload = args.variables;

            const docRef = await addDoc(ref, payload);

            let data = {
                id: docRef.id,
                ...payload
            };

            return { data };
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async createManyData<TVariables = {}>(args: any): Promise<any> {
        try {
            var data = await this.createData(args);

            return { data };
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async deleteData(args: any): Promise<any> {
        try {
            const ref = this.getDocRef(args.resource, args.id);

            await deleteDoc(ref);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async deleteManyData(args: any): Promise<any> {
        try {
            args.ids.forEach(async (id: string) => {
                this.deleteData({ resource: args.resource, id });
            });
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async getList(args: any): Promise<any> {
        try {
            const ref = this.getFilterQuery(args);
            let data: any[] = [];
            const current = args.pagination?.current ?? 1;
            const limit = args.pagination?.pageSize || 10;

            const querySnapshot = await getDocs(ref);

            querySnapshot.forEach(document => {
                data.push({
                    id: document.id,
                    ...document.data()
                });
            });
            return { data };

        } catch (error) {
            return Promise.reject(error);
        }
    }

    async getMany(args: any): Promise<any> {
        try {
            const ref = this.getCollectionRef(args.resource);
            let data: any[] = [];

            const querySnapshot = await getDocs(ref);

            querySnapshot.forEach(document => {
                if (args.ids.includes(document.id)) {
                    data.push({
                        id: document.id,
                        ...document.data()
                    });
                }
            });
            return { data };
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async getOne(args: any): Promise<any> {
        try {
            if (args.resource && args.id) {
                const docRef = this.getDocRef(args.resource, args.id);

                const docSnap = await getDoc(docRef);

                const data = { ...docSnap.data(), id: docSnap.id };

                return { data };
            }

        } catch (error: any) {
            return Promise.reject(error);
        }
    }

    async updateData<TVariables = {}>(args: any): Promise<any> {
        try {
            if (args.id && args.resource) {
                var ref = this.getDocRef(args.resource, args.id);
                await updateDoc(ref, args.variables);
            }

            return { data: args.variables };
        } catch (error) {
            return Promise.reject(error);
        }
    }
    async updateManyData<TVariables = {}>(args: any): Promise<any> {
        try {
            args.ids.forEach(async (id: string) => {
                var ref = this.getDocRef(args.resource, id);
                await updateDoc(ref, args.variables);
            });

        } catch (error) {
            return Promise.reject(error);
        }
    }
}

const firestoreDatabase = new FirestoreDatabase({}, db);

const dataprovider: DataProvider = {
    getList: async ({ resource, pagination, sorters, filters, meta }) => {
        const args = {
            resource,
            pagination,
            sort: sorters,
            filters,
        };
        return firestoreDatabase.getList(args);
    },
    create: async ({ resource, variables, meta }) => {
        const args = {
            resource,
            variables,
        };
        return firestoreDatabase.createData(args);
    },
    update: async ({ resource, id, variables, meta }) => {
        const args = {
            resource,
            id,
            variables,
        };
        return firestoreDatabase.updateData(args);
    },
    deleteOne: async ({ resource, id, variables, meta }) => {
        const args = {
            resource,
            id,
        };
        return firestoreDatabase.deleteData(args);
    },
    getOne: async ({ resource, id, meta }) => {
        const args = {
            resource,
            id,
        };
        return firestoreDatabase.getOne(args);
    },
    getApiUrl: () => {
        return "";
    },
    getMany: async ({ resource, ids, meta }) => {
        const args = {
            resource,
            ids,
        };
        return firestoreDatabase.getMany(args);
    },
    createMany: async ({ resource, variables, meta }) => {
        const args = {
            resource,
            variables,
        };
        return firestoreDatabase.createManyData(args);
    },
    deleteMany: async ({ resource, ids, variables, meta }) => {
        const args = {
            resource,
            ids,
        };
        return firestoreDatabase.deleteManyData(args);
    },
    updateMany: async ({ resource, ids, variables, meta }) => {
        const args = {
            resource,
            ids,
            variables,
        };
        return firestoreDatabase.updateManyData(args);
    },
};



function getFilterOperator(operator: any) {
    switch (operator) {
        case "lt":
            return "<";
        case "lte":
            return "<=";
        case "gt":
            return ">";
        case "gte":
            return ">=";
        case "eq":
            return "==";
        case "ne":
            return "!=";
        case "nin":
            return "not-in";
        case "in":
        default:
            return "in";
    }
}

export default dataprovider;
