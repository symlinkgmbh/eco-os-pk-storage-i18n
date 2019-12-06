/**
 * Copyright 2018-2019 Symlink GmbH
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 */



import { STORAGE_TYPES, storageContainer, AbstractBindings } from "@symlinkde/eco-os-pk-storage";
import { PkStorageI18n, PkStorage } from "@symlinkde/eco-os-pk-models";
import { bootstrapperContainer } from "@symlinkde/eco-os-pk-core";
import Config from "config";
import { injectable } from "inversify";

@injectable()
export class LocaleService extends AbstractBindings implements PkStorageI18n.ILocaleService {
  private localeRepro: PkStorage.IMongoRepository<PkStorageI18n.ILocaleStorageEntry>;

  public constructor() {
    super(storageContainer);

    this.initDynamicBinding(
      [STORAGE_TYPES.Database, STORAGE_TYPES.Collection, STORAGE_TYPES.StorageTarget],
      [Config.get("mongo.db"), Config.get("mongo.collection"), "SECONDLOCK_MONGO_LOCALE_DATA"],
    );

    this.initStaticBinding(
      [STORAGE_TYPES.SECONDLOCK_REGISTRY_URI, STORAGE_TYPES.IndexConfig],
      [bootstrapperContainer.get("SECONDLOCK_REGISTRY_URI"), { name: "locale_index", fields: [{ locale: 1, key: 1 }] }],
    );

    this.localeRepro = this.getContainer().getTagged<PkStorage.IMongoRepository<PkStorageI18n.ILocaleStorageEntry>>(
      STORAGE_TYPES.IMongoRepository,
      STORAGE_TYPES.EXTEND_CONFIG,
      true,
    );
  }

  public async add(obj: PkStorageI18n.ILocaleStorageEntry): Promise<PkStorageI18n.ILocaleStorageEntry> {
    const objectId = await this.localeRepro.create(obj);
    obj._id = objectId;
    return obj;
  }

  public async addAll(docs: Array<PkStorageI18n.ILocaleStorageEntry>): Promise<void> {
    await this.localeRepro.createMany(docs);
  }

  public async get(locale: string, key: string): Promise<PkStorageI18n.ILocaleStorageEntry | null> {
    const result = await this.localeRepro.find({ locale, key });

    if (result === undefined || result === null) {
      return null;
    }

    return result[0];
  }

  public async getAll(locale: string): Promise<Array<PkStorageI18n.ILocaleStorageEntry> | null> {
    return await this.localeRepro.find({ locale });
  }

  public async deleteAll(): Promise<boolean> {
    return await this.localeRepro.deleteMany({});
  }

  public async getById(id: string): Promise<PkStorageI18n.ILocaleStorageEntry | null> {
    return await this.localeRepro.findOne(id);
  }

  public async updateById(id: string, obj: PkStorageI18n.ILocaleStorageEntry): Promise<boolean> {
    return await this.localeRepro.update<PkStorageI18n.ILocaleStorageEntry>(id, obj);
  }
  public async deleteById(id: string): Promise<boolean> {
    return await this.localeRepro.delete(id);
  }
}
